// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

////////////////////
// * Imports 	  //
////////////////////

import {CharityStableCoin} from "./CharityStableCoin.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract CSCEngine {
    ////////////////////
    // * Errors 	  //
    ////////////////////
    error CSCEngine__TokenAddressesAndPriceFeedAddressesMustBeSameLength();

    ////////////////////
    // * Types 		  //
    ////////////////////

    ////////////////////
    // * Variables	  //
    ////////////////////
    CharityStableCoin private immutable i_csc;
    address private immutable i_collateralAddress;
    address private immutable i_priceFeedAddress;

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
        i_collateralAddress = _tokenAddress;
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

    ////////////////////
    // * Internal 	  //
    ////////////////////

    ////////////////////
    // * Private 	  //
    ////////////////////

    ////////////////////
    // * View & Pure  //
    ////////////////////

    function getCollateralTokenAddress() public view returns (address) {
        return i_collateralAddress;
    }

    function getpriceFeedAddress() public view returns (address) {
        return i_priceFeedAddress;
    }
}
