// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

////////////////////
// * Imports 	  //
////////////////////
import {ERC20Burnable, ERC20} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
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
contract CharityStableCoin is ERC20Burnable, Ownable {
    error CharityStableCoin__MustBeMoreThanZero();
    error CharityStableCoin__BurnAmountExceedsBalance();
    error CharityStableCoin__NotZeroAddress();

    constructor() ERC20("CharityStableCoin", "CSC") Ownable(msg.sender) {}

    function burn(uint256 _amount) public override onlyOwner {
        uint256 balance = balanceOf(msg.sender);
        if (_amount <= 0) revert CharityStableCoin__MustBeMoreThanZero();
        if (balance < _amount) revert CharityStableCoin__BurnAmountExceedsBalance();

        // ! super.burn because it is overriding function from ERC20Burnable
        super.burn(_amount);
    }

    function mint(address _to, uint256 _amount) external onlyOwner returns (bool) {
        if (_to == address(0)) revert CharityStableCoin__NotZeroAddress();
        if (_amount <= 0) revert CharityStableCoin__MustBeMoreThanZero();

        _mint(_to, _amount);
        return true;
    }
}
