import { network, ethers, getNamedAccounts, deployments } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert, expect } from "chai";

import { developmentChains } from "../../utils/helper.config";
import {
	ERC20Mock,
	MockV3Aggregator,
	SCEngine,
	StableCoin,
} from "../../typechain-types";

const isDevelopmentChain = developmentChains.includes(network.name);

!isDevelopmentChain
	? describe.skip
	: describe("Example Unit Tests", () => {
			const CHAIN_ID = network.config.chainId;
			const MINT_AMOUNT = ethers.parseEther("1111");
			const ONE_ETHER = ethers.parseEther("1");

			let erc20Mock: ERC20Mock;
			let ethPriceFeedMock: MockV3Aggregator;
			let stableCoin: StableCoin;
			let engine: SCEngine;

			let accounts: HardhatEthersSigner[];
			let deployer: HardhatEthersSigner;
			let player1: HardhatEthersSigner;
			let player2: HardhatEthersSigner;

			beforeEach(async () => {
				await deployments.fixture(["all"]);

				// ! Test accounts provided by Hardhat
				const accounts = await ethers.getSigners();
				deployer = accounts[0];
				player1 = accounts[1];
				player2 = accounts[2];

				// TODO maybe its better to instantly take only addresses
				// const accounts1 = await getNamedAccounts();
				// const deployerAddr = (await getNamedAccounts()).deployer;

				// console.log(deployer, player1, player2);
				// console.log("accounts", accounts);
				// console.log(accounts1);

				console.log("UNIT TEST");
				// ! Do some code here
				// ! Get deployed contracts and mocks, and add constants that will be used
			});

			describe("Constructor Tests", () => {
				it("Example test", async () => {
					assert.equal(1, 1);
				});
			});
		});
