import { network, ethers, getNamedAccounts, deployments } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert, expect } from "chai";

import { developmentChains } from "../../utils/helper.config";
import {
	CSCEngine,
	CharityStableCoin,
	ERC20Mock,
	MockV3Aggregator,
} from "../../typechain-types";

const isDevelopmentChain = developmentChains.includes(network.name);
console.log("Unit test");

!isDevelopmentChain
	? describe.skip
	: describe("StableCoin Unit Tests", () => {
			const CHAIN_ID = network.config.chainId!!!;

			let stableCoin: CharityStableCoin;
			let engine: CSCEngine;
			let erc20Mock: ERC20Mock;
			let ethPriceFeedMock: MockV3Aggregator;

			let deployer: string;
			let accounts: HardhatEthersSigner[];

			beforeEach(async () => {
				await deployments.fixture(["all"]);
				deployer = (await getNamedAccounts()).deployer;

				erc20Mock = await ethers.getContract("ERC20Mock", deployer);
				ethPriceFeedMock = await ethers.getContract(
					"MockV3Aggregator",
					deployer,
				);
				stableCoin = await ethers.getContract("CharityStableCoin", deployer);
				engine = await ethers.getContract("CSCEngine", deployer);
				accounts = await ethers.getSigners();
			});

			describe("Constructor Tests", () => {
				it("Collateral Token Address initializes correctly", async () => {
					assert.equal(
						await erc20Mock.getAddress(),
						await engine.getCollateralTokenAddress(),
					);
				});
			});
		});
