// import { network, ethers, getNamedAccounts, deployments } from "hardhat";
// import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
// import { assert, expect } from "chai";

// import { developmentChains } from "../../utils/helper.config";
// import { CSCEngine, CharityStableCoin } from "../../typechain-types";

// const isDevelopmentChain = developmentChains.includes(network.name);

// !isDevelopmentChain
// 	? describe.skip
// 	: describe("CharityStableCoin Unit Tests", () => {
// 			const CHAIN_ID = network.config.chainId!!!;
// 			const MINT_AMOUNT = ethers.parseEther("1");
// 			const ADDRESS_ZERO = ethers.ZeroAddress;

// 			let stableCoin: CharityStableCoin;
// 			let cscEngine: CSCEngine;
// 			let deployer: string;
// 			let accounts: HardhatEthersSigner[];

// 			beforeEach(async () => {
// 				await deployments.fixture(["all"]);
// 				accounts = await ethers.getSigners();
// 				deployer = (await getNamedAccounts()).deployer;

// 				stableCoin = await ethers.getContract("CharityStableCoin");
// 				cscEngine = await ethers.getContract("CSCEngine", deployer);
// 				// !!!!! Should find a way to connect cscEngine with stableCoin and then call function, because only owner can call them !!!!!
// 			});

// 			describe("Mint Tests", () => {
// 				it("Reverts if Address Zero", async () => {
// 					await expect(
// 						stableCoin.mint(ADDRESS_ZERO, MINT_AMOUNT),
// 					).to.be.revertedWithCustomError(
// 						stableCoin,
// 						"CharityStableCoin__NotZeroAddress",
// 					);
// 				});

// 				it("Reverts if amount zero", async () => {
// 					await expect(
// 						stableCoin.mint(deployer, 0),
// 					).to.be.revertedWithCustomError(
// 						stableCoin,
// 						"CharityStableCoin__MustBeMoreThanZero",
// 					);
// 				});

// 				it("Mints tokens", async () => {
// 					// ! check balance after minting
// 					// console.log(await stableCoin.mint(deployer, MINT_AMOUNT));
// 				});
// 			});
// 		});
