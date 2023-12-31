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
	: describe("CharityStableCoin Unit Tests", () => {
			const CHAIN_ID = network.config.chainId!!!;

			let stableCoin: CharityStableCoin;

			const MINT_AMOUNT = ethers.parseEther("1");
			const ADDRESS_ZERO = ethers.ZeroAddress;

			let deployer: string;
			let accounts: HardhatEthersSigner[];

			beforeEach(async () => {
				await deployments.fixture(["all"]);
				accounts = await ethers.getSigners();
				deployer = (await getNamedAccounts()).deployer;

				stableCoin = await ethers.getContract("CharityStableCoin", deployer);
			});

			describe("Mint Tests", () => {
				// !!!!! reverts if not owner, SWITCH OWNER TO CSCEngine first !!!!!

				it("Reverts if Address Zero", async () => {
					await expect(
						stableCoin.mint(ADDRESS_ZERO, MINT_AMOUNT),
					).to.be.revertedWithCustomError(
						stableCoin,
						"CharityStableCoin__NotZeroAddress",
					);
				});

				it("Reverts if amount zero", async () => {
					await expect(
						stableCoin.mint(deployer, 0),
					).to.be.revertedWithCustomError(
						stableCoin,
						"CharityStableCoin__MustBeMoreThanZero",
					);
				});

				it("Mints tokens", async () => {
					// ! check balance after minting
					// console.log(await stableCoin.mint(deployer, MINT_AMOUNT));
				});
			});
		});
