// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

////////////////////
// * Imports 	  //
////////////////////

import {CharityStableCoin} from "./CharityStableCoin.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract CSCEngine is ReentrancyGuard {
    ////////////////////
    // * Errors 	  //
    ////////////////////
    error CSCEngine__TokenAddressesAndPriceFeedAddressesMustBeSameLength();
    error CSCEngine__TransactionFailed();
    error CSCEngine__MustBeMoreThanZero();
    error CSCEngine__MintFailed();

    ////////////////////
    // * Types 		  //
    ////////////////////

    ////////////////////
    // * Variables	  //
    ////////////////////

    CharityStableCoin private immutable i_csc;
    address private immutable i_tokenCollateralAddress;
    address private immutable i_priceFeedAddress;

    mapping(address => uint256) s_collateralDeposited;
    mapping(address => uint256) s_CscMinted;

    ////////////////////
    // * Events 	  //
    ////////////////////
    event CollateralDeposited(address sender, uint256 amount);

    ////////////////////
    // * Modifiers 	  //
    ////////////////////
    modifier isMoreThanZero(uint256 _amount) {
        if (_amount <= 0) revert CSCEngine__MustBeMoreThanZero();
        _;
    }

    ////////////////////
    // * Functions	  //
    ////////////////////

    ////////////////////
    // * Constructor  //
    ////////////////////
    constructor(address _tokenAddress, address _priceFeedAddress, address _cscAddress) {
        i_tokenCollateralAddress = _tokenAddress;
        i_priceFeedAddress = _priceFeedAddress;
        i_csc = CharityStableCoin(_cscAddress);
    }

    ////////////////////////////
    // * Receive & Fallback   //
    ////////////////////////////

    ////////////////////
    // * External 	  //
    ////////////////////

    ////////////////////
    // * Public 	  //
    ////////////////////
    // TODO maybe switch to external and remove nonReentrant if not needed
    function depositCollateral(uint256 _amount) public isMoreThanZero(_amount) nonReentrant {
        s_collateralDeposited[msg.sender] += _amount;
        emit CollateralDeposited(msg.sender, _amount);
        bool success = IERC20(i_tokenCollateralAddress).transferFrom(msg.sender, address(this), _amount);
        if (!success) revert CSCEngine__TransactionFailed();
    }

    function mintCsc(uint256 _amountCscToMint) public isMoreThanZero(_amountCscToMint) nonReentrant {
        s_CscMinted[msg.sender] += _amountCscToMint;
        // ! Check if can mint
        bool success = i_csc.mint(msg.sender, _amountCscToMint);
        if (!success) revert CSCEngine__MintFailed();
    }

    ////////////////////
    // * Internal 	  //
    ////////////////////

    ////////////////////
    // * Private 	  //
    ////////////////////

    ////////////////////
    // * View & Pure  //
    ////////////////////

    function getUserInformation(address _user)
        public
        view
        returns (uint256 _totalCscMinted, uint256 _totalCollateralValue)
    {
        _totalCscMinted = getCscMintedForUser(_user);
        _totalCollateralValue = getCollateralValueForUser(_user);
    }

    function getCscMintedForUser(address _user) public view returns (uint256) {
        return s_CscMinted[_user];
    }

    function getCollateralValueForUser(address _user) public view returns (uint256) {
        return s_collateralDeposited[_user];
    }

    function getCollateralTokenAddress() external view returns (address) {
        return i_tokenCollateralAddress;
    }

    function getPriceFeedAddress() external view returns (address) {
        return i_priceFeedAddress;
    }

    function getCSCAddress() external view returns (address) {
        return address(i_csc);
    }

    function getCollateralDeposited(address _person) external view returns (uint256) {
        return s_collateralDeposited[_person];
    }
}
