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
    error SCEngine__NotAllowedToken();
    error SCEngine__TransferFailed();

    ////////////////////
    // * Types 		  //
    ////////////////////

    ////////////////////
    // * Variables	  //
    ////////////////////
    StableCoin private immutable i_sc;
    mapping(address token => address priceFeed) private s_priceFeeds;
    mapping(address user => mapping(address token => uint256 amount)) private s_collateralDeposited;
    mapping(address user => uint256 amountSCMinted) private s_SCMinted;
    address[] private s_collateralTokens;

    ////////////////////
    // * Events 	  //
    ////////////////////
    event CollateralDeposited(address indexed user, address indexed tokenAddress, uint256 indexed amount);

    ////////////////////
    // * Modifiers 	  //
    ////////////////////
    modifier moreThanZero(uint256 _amount) {
        if (_amount == 0) revert SCEngine__NeedsMoreThanZero();
        _;
    }

    modifier isAllowedToken(address _tokenAddress) {
        if (_tokenAddress == address(0)) revert SCEngine__NotAllowedToken();
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
     * @param _tokenCollateralAddress The address of the token to be deposited as collateral
     * @param _amountCollateral The amount of collateral to deposit
     */
    function depositCollateral(address _tokenCollateralAddress, uint256 _amountCollateral)
        external
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
    function mintSC(uint256 amountSCToMint) external moreThanZero(amountSCToMint) nonReentrant {
        s_SCMinted[msg.sender] += amountSCToMint;
        _revertIfHealthFactorIsBroken(msg.sender);
    }

    function redeemCollateralForSC() external {}

    function redeemCollateral() external {}

    function burnSC() external {}

    function liquidate() external {}

    ////////////////////
    // * Public 	  //
    ////////////////////

    ////////////////////
    // * Internal 	  //
    ////////////////////

    ////////////////////
    // * Private 	  //
    ////////////////////

    ////////////////////
    // * View & Pure  //
    ////////////////////
    function getHealthFactor() external view {}

    function getAccountCollateralValue(address user) public view returns (uint256 collaterallValueInUSD) {
        for (uint256 i = 0; i < s_collateralTokens.length; i++) {
            address token = s_collateralTokens[i];
            uint256 amount = s_collateralDeposited[user][token];
            collaterallValueInUSD += getUSDValue(token, amount);
        }
    }

    function getUSDValue(address token, uint256 amount) public view returns (uint256) {}

    function _revertIfHealthFactorIsBroken(address user) internal view {}

    function _healthFactor(address user) internal view returns (uint256) {
        (uint256 totalSCMinted, uint256 collateralValueInUSD) = _getAccountInformation(user);
    }

    function _getAccountInformation(address user)
        private
        view
        returns (uint256 totalSCMinted, uint256 collateralValueInUSD)
    {
        totalSCMinted = s_SCMinted[user];
        collateralValueInUSD = getAccountCollateralValue(user);
    }
}
