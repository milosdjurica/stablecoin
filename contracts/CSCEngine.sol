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
    address private immutable i_priceFeed;

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
    constructor(address tokenAddress, address priceFeedAddress, address cscAddress) {
        i_collateralAddress = tokenAddress;
        i_priceFeed = priceFeedAddress;
        i_csc = CharityStableCoin(cscAddress);
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
}
