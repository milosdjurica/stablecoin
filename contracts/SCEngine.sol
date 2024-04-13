// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

////////////////////
// * Imports 	  //
////////////////////
import {StableCoin} from "./StableCoin.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";
/**
 * @title SCEngine
 * @author Milos Djurica
 * @notice
 *
 * ! Add description!!!
 */

contract SCEngine is ReentrancyGuard {
    ////////////////////
    // * Errors 	  //
    ////////////////////
    error SCEngine__NeedsMoreThanZero();
    error SCEngine__TokenAddressesAndPriceFeedAddressesNotSameLength();
    error SCEngine__NotAllowedToken(address tokenAddress);
    error SCEngine__TransferFailed();
    error SCEngine__BreaksHealthFactor(uint256 userHealthFactor);
    error SC__MintFailed();
    error SCEngine__HealthFactorIsFine();

    ////////////////////
    // * Types 		  //
    ////////////////////

    ////////////////////
    // * Variables	  //
    ////////////////////
    uint256 private constant ADDITIONAL_FEED_PRECISION_10 = 10e10;
    uint256 private constant PRECISION_18 = 10e18;
    uint256 private constant LIQUIDATION_THRESHOLD = 50;
    uint256 private constant LIQUIDATION_PRECISION = 100;
    uint256 private constant LIQUIDATION_BONUS = 10; // ! 10% bonus
    uint256 private constant MIN_HEALTH_FACTOR = 1e18;
    StableCoin private immutable i_sc;
    mapping(address token => address priceFeed) private s_priceFeeds;
    mapping(address user => mapping(address token => uint256 amount)) private s_collateralDeposited;
    mapping(address user => uint256 amountSCMinted) private s_SCMinted;
    address[] private s_collateralTokens;

    ////////////////////
    // * Events 	  //
    ////////////////////
    event CollateralDeposited(address indexed user, address indexed tokenAddress, uint256 indexed amount);
    event CollateralRedeemed(
        address indexed redeemedFrom, address indexed redeemedTo, address indexed tokenAddress, uint256 amount
    );

    ////////////////////
    // * Modifiers 	  //
    ////////////////////
    modifier moreThanZero(uint256 _amount) {
        if (_amount == 0) revert SCEngine__NeedsMoreThanZero();
        _;
    }

    modifier isAllowedToken(address _tokenAddress) {
        if (_tokenAddress == address(0)) revert SCEngine__NotAllowedToken(_tokenAddress);
        _;
    }

    ////////////////////
    // * Functions	  //
    ////////////////////

    ////////////////////
    // * Constructor  //
    ////////////////////
    constructor(address[] memory _tokenAddresses, address[] memory _priceFeedAddresses, address _SCAddress) {
        if (_tokenAddresses.length != _priceFeedAddresses.length) {
            revert SCEngine__TokenAddressesAndPriceFeedAddressesNotSameLength();
        }
        for (uint256 i = 0; i < _tokenAddresses.length; i++) {
            s_priceFeeds[_tokenAddresses[i]] = _priceFeedAddresses[i];
            s_collateralTokens.push(_tokenAddresses[i]);
        }
        i_sc = StableCoin(_SCAddress);
    }

    ////////////////////////////
    // * Receive & Fallback   //
    ////////////////////////////

    ////////////////////
    // * External 	  //
    ////////////////////

    /**
     *
     * @param _tokenCollateralAddress Address of ERC20 Token for collateral
     * @param _amountCollateral Amount of collateral to deposit
     * @param _amountSCToMint Amount of StableCoin to mint
     */
    function depositCollateralAndMintSC(
        address _tokenCollateralAddress,
        uint256 _amountCollateral,
        uint256 _amountSCToMint
    ) external {
        depositCollateral(_tokenCollateralAddress, _amountCollateral);
        mintSC(_amountSCToMint);
    }

    function burnSCAndRedeemCollateral(
        address _tokenCollateralAddress,
        uint256 _amountCollateral,
        uint256 _amountSCToBurn
    ) external {
        burnSC(_amountSCToBurn);
        redeemCollateral(_tokenCollateralAddress, _amountCollateral);
    }

    function liquidate(address _collateral, address _user, uint256 _debtToCover)
        external
        moreThanZero(_debtToCover)
        nonReentrant
    {
        uint256 startingUserHealthFactor = _healthFactor(_user);
        if (startingUserHealthFactor >= MIN_HEALTH_FACTOR) revert SCEngine__HealthFactorIsFine();
        uint256 tokenAmountFromDebtCovered = getTokenAmountFromUSD(_collateral, _debtToCover);
        // ! And give 10% bonus
        uint256 bonusCollateral = tokenAmountFromDebtCovered * LIQUIDATION_BONUS / LIQUIDATION_PRECISION;
        uint256 totalCollateralWithBonus = tokenAmountFromDebtCovered + bonusCollateral;
        _redeemCollateral(_user, msg.sender, _collateral, totalCollateralWithBonus);
    }

    ////////////////////
    // * Public 	  //
    ////////////////////
    /**
     *
     * @param _tokenCollateralAddress The address of the token to be deposited as collateral
     * @param _amountCollateral The amount of collateral to deposit
     */
    function depositCollateral(address _tokenCollateralAddress, uint256 _amountCollateral)
        public
        moreThanZero(_amountCollateral)
        isAllowedToken(_tokenCollateralAddress)
        nonReentrant
    {
        s_collateralDeposited[msg.sender][_tokenCollateralAddress] += _amountCollateral;
        emit CollateralDeposited(msg.sender, _tokenCollateralAddress, _amountCollateral);
        bool success = IERC20(_tokenCollateralAddress).transferFrom(msg.sender, address(this), _amountCollateral);
        if (!success) revert SCEngine__TransferFailed();
    }

    /**
     *
     * @param amountSCToMint Amount of Stablecoin to mint
     */
    function mintSC(uint256 amountSCToMint) public moreThanZero(amountSCToMint) nonReentrant {
        s_SCMinted[msg.sender] += amountSCToMint;
        _revertIfHealthFactorIsBroken(msg.sender);
        bool minted = i_sc.mint(msg.sender, amountSCToMint);
        if (!minted) revert SC__MintFailed();
    }

    function burnSC(uint256 _amountToBurn) public moreThanZero(_amountToBurn) {
        s_SCMinted[msg.sender] -= _amountToBurn;
        bool success = i_sc.transferFrom(msg.sender, address(this), _amountToBurn);
        if (!success) revert SCEngine__TransferFailed();
        i_sc.burn(_amountToBurn);
        // ! Probably dont really need this line
        _revertIfHealthFactorIsBroken(msg.sender);
    }

    function redeemCollateral(address _tokenCollateralAddress, uint256 _amountCollateral)
        public
        moreThanZero(_amountCollateral)
        nonReentrant
    {
        _redeemCollateral(msg.sender, msg.sender, _tokenCollateralAddress, _amountCollateral);
        _revertIfHealthFactorIsBroken(msg.sender);
    }

    ////////////////////
    // * Internal 	  //
    ////////////////////

    ////////////////////
    // * Private 	  //
    ////////////////////
    function _redeemCollateral(address _tokenCollateralAddress, uint256 _amountCollateral, address _from, address _to)
        private
    {
        s_collateralDeposited[_from][_tokenCollateralAddress] -= _amountCollateral;
        emit CollateralRedeemed(_from, _to, _tokenCollateralAddress, _amountCollateral);
        bool success = IERC20(_tokenCollateralAddress).transfer(to, _amountCollateral);
        if (!success) revert SCEngine__TransferFailed();
    }

    ////////////////////
    // * View & Pure  //
    ////////////////////
    function getHealthFactor() external view {}

    function getTokenAmountFromUSD(address _collateral, uint256 _USDAmountInWei) public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(s_priceFeeds[_collateral]);
        (, int256 price,,,) = priceFeed.latestRoundData();
        // ($1000e18 * 1e18) / ($2000e8 * 1e10) = 0.500 000 000 000 000 000
        return (_USDAmountInWei * PRECISION_18) / (uint256(price) * ADDITIONAL_FEED_PRECISION_10);
    }

    function getCollateralTokensAddresses() public view returns (address[] memory) {
        return s_collateralTokens;
    }

    function getPriceFeedAddress(address _collateralToken) public view returns (address) {
        return s_priceFeeds[_collateralToken];
    }

    function getSCAddress() public view returns (StableCoin) {
        return i_sc;
    }

    function getOneCollateralDeposited(address _user, address _tokenAddress)
        public
        view
        returns (uint256 collateralDeposited)
    {
        return s_collateralDeposited[_user][_tokenAddress];
    }

    function getAccountCollateralValueInUSD(address _user) public view returns (uint256 collaterallValueInUSD) {
        for (uint256 i = 0; i < s_collateralTokens.length; i++) {
            address token = s_collateralTokens[i];
            uint256 amount = s_collateralDeposited[_user][token];
            collaterallValueInUSD += getUSDValue(token, amount);
        }
        return collaterallValueInUSD;
    }

    function getUSDValue(address _token, uint256 _amount) public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(s_priceFeeds[_token]);
        (, int256 price,,,) = priceFeed.latestRoundData();
        // ! Price is 2345 * 10e8 -> because of that we need to put it on same precision (10e18)
        return ((uint256(price) * ADDITIONAL_FEED_PRECISION_10) * _amount) / PRECISION_18;
    }

    function _revertIfHealthFactorIsBroken(address _user) internal view {
        uint256 userHealthFactor = _healthFactor(_user);
        if (userHealthFactor < MIN_HEALTH_FACTOR) revert SCEngine__BreaksHealthFactor(userHealthFactor);
    }

    function _healthFactor(address _user) internal view returns (uint256) {
        (uint256 totalSCMinted, uint256 collateralValueInUSD) = _getAccountInformation(_user);
        // ! must have 2x collaretral value than SC

        // ! Bad example
        // $150 ETH / 100 SC = 1.5
        // 150*50 = 7500/100 = 75/100DSC <1 !!!

        // ! Good example
        // $1000 ETH / 200 SC = 5
        // 1000 * 50 = 50 000 / 100 = 500 / 200 > 1 !!!
        // ! Basically this line just divides with 2, because we need to have more than 2x collateral than SC
        uint256 collateralAdjustedForThreshold = (collateralValueInUSD * LIQUIDATION_THRESHOLD) / LIQUIDATION_PRECISION;
        return collateralAdjustedForThreshold * PRECISION_18 / totalSCMinted;
    }

    function _getAccountInformation(address user)
        private
        view
        returns (uint256 totalSCMinted, uint256 collateralValueInUSD)
    {
        totalSCMinted = s_SCMinted[user];
        collateralValueInUSD = getAccountCollateralValueInUSD(user);
    }
}
