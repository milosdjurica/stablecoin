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

    mapping(address token => address priceFeed) private s_priceFeeds;

    address[] private s_collateralDeposited;

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
    constructor(address[] memory tokenAddresses, address[] memory priceFeedAddresses, address cscAddress) {
        if (tokenAddresses.length != priceFeedAddresses.length) {
            revert CSCEngine__TokenAddressesAndPriceFeedAddressesMustBeSameLength();
        }

        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            s_priceFeeds[tokenAddresses[i]] = priceFeedAddresses[i];
            s_collateralDeposited.push(tokenAddresses[i]);
        }
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
