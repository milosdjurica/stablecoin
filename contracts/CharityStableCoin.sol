// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

////////////////////
// * Imports 	  //
////////////////////
import {ERC20Burnable, ERC20} from "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
// Uncomment this line to use console.log
// import "hardhat/console.sol";

/**
 * @title CharityStableCoin
 * @author Milos Djurica
 * @notice
 * Collateral: Exogenous (ETH)
 * Minting: Algorithmic
 * Relative Stability: Pegged to USD
 *
 * ERC20 Implementation of my stablecoin. This contract is meant to be governed by CSCEngine
 */
contract CharityStableCoin is ERC20Burnable {
    ////////////////////
    // * Errors 	  //
    ////////////////////

    ////////////////////
    // * Types 		  //
    ////////////////////

    ////////////////////
    // * Variables	  //
    ////////////////////

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
    constructor() ERC20("CharityStableCoin", "CSC") {}

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
