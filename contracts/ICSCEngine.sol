// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

////////////////////
// * Imports 	  //
////////////////////
// Uncomment this line to use console.log
// import "hardhat/console.sol";
/**
 * @title CSCEngine
 * @author Milos Djurica
 * @notice
 *
 * ! Add description!!!
 */
contract ICSCEngine {
    function depositCollateralAndMintCSC() external {}

    function redeemCollateralForCSC() external {}

    function mintCSC() external {}

    function redeemCollateral() external {}

    function burnCSC() external {}

    function liquidate() external {}

    function getHealthFactor() external view {}
}
