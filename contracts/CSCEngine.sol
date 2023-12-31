// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

////////////////////
// * Imports 	  //
////////////////////

import {CharityStableCoin} from "./CharityStableCoin.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract CSCEngine {
    ////////////////////
    // * Errors 	  //
    ////////////////////
    error CSCEngine__TokenAddressesAndPriceFeedAddressesMustBeSameLength();
    error CSCEngine__TransactionFailed();

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

    ////////////////////
    // * Events 	  //
    ////////////////////

    ////////////////////
    // * Modifiers 	  //
    ////////////////////

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
    function depositCollateral(uint256 _amount) public {
        s_collateralDeposited[msg.sender] += _amount;
        bool success = IERC20(i_tokenCollateralAddress).transferFrom(msg.sender, address(this), _amount);
        if (!success) revert CSCEngine__TransactionFailed();
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

    function getCollateralTokenAddress() external view returns (address) {
        return i_tokenCollateralAddress;
    }

    function getPriceFeedAddress() external view returns (address) {
        return i_priceFeedAddress;
    }

    function getCSCAddress() external view returns (address) {
        return address(i_csc);
    }
}
