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

!isDevelopmentChain
	? describe.skip
	: describe("CSCEngine Unit Tests", () => {
			const CHAIN_ID = network.config.chainId!!!;
			const MINT_AMOUNT = ethers.parseEther("1111");
			const ONE_ETHER = ethers.parseEther("1");

			let erc20Mock: ERC20Mock;
			let ethPriceFeedMock: MockV3Aggregator;
			let stableCoin: CharityStableCoin;
			let engine: CSCEngine;

			let deployer: string;
			let accounts: HardhatEthersSigner[];

			beforeEach(async () => {
				await deployments.fixture(["all"]);

				accounts = await ethers.getSigners();
				deployer = (await getNamedAccounts()).deployer;

				erc20Mock = await ethers.getContract("ERC20Mock", deployer);
				ethPriceFeedMock = await ethers.getContract(
					"MockV3Aggregator",
					deployer,
				);
				stableCoin = await ethers.getContract("CharityStableCoin", deployer);
				engine = await ethers.getContract("CSCEngine", deployer);
			});

			describe("Constructor Tests", () => {
				it("Collateral Token Address initializes correctly", async () => {
					assert.equal(
						await erc20Mock.getAddress(),
						await engine.getCollateralTokenAddress(),
					);
				});

				it("Price Feed Address initializes correctly", async () => {
					assert.equal(
						await ethPriceFeedMock.getAddress(),
						await engine.getPriceFeedAddress(),
					);
				});

				it("Initializes CSC correctly", async () => {
					assert.equal(
						await stableCoin.getAddress(),
						await engine.getCSCAddress(),
					);
				});
			});

			describe("Deposit Collateral Tests", () => {
				it("Should Revert if 0 amount", async () => {
					await expect(
						engine.depositCollateral(0),
					).to.be.revertedWithCustomError(
						engine,
						"CSCEngine__MustBeMoreThanZero",
					);
				});

				it("Reverts if user doesn't have enough WETH balance", async () => {
					await erc20Mock.approve(engine, ONE_ETHER);

					// ! Args -> sender, current balance, needed
					await expect(engine.depositCollateral(ONE_ETHER))
						.to.be.revertedWithCustomError(
							erc20Mock,
							"ERC20InsufficientBalance",
						)
						.withArgs(deployer, 0, ONE_ETHER);
				});

				it("Reverts if user doesn't approve engine contract", async () => {
					await expect(engine.depositCollateral(ONE_ETHER))
						.to.be.revertedWithCustomError(
							erc20Mock,
							"ERC20InsufficientAllowance",
						)
						.withArgs(await engine.getAddress(), 0, ONE_ETHER);
				});

				it("Adds collateral to s_collateralDeposited mappings", async () => {
					erc20Mock.mint(deployer, MINT_AMOUNT);

					await erc20Mock.approve(engine, ONE_ETHER);
					await engine.depositCollateral(ONE_ETHER);
					assert.equal(
						ONE_ETHER,
						await engine.getCollateralDepositedForUser(deployer),
					);
				});

				it("Emits event when depositing", async () => {
					erc20Mock.mint(deployer, MINT_AMOUNT);
					await erc20Mock.approve(engine, ONE_ETHER);
					await expect(engine.depositCollateral(ONE_ETHER))
						.to.emit(engine, "CollateralDeposited")
						.withArgs(deployer, ONE_ETHER);
				});
			});

			describe("View and pure functions", () => {
				it("getCscAddress", async () => {
					assert.equal(
						await stableCoin.getAddress(),
						await engine.getCSCAddress(),
					);
				});

				it("getCollateralTokenAddress", async () => {
					assert.equal(
						await erc20Mock.getAddress(),
						await engine.getCollateralTokenAddress(),
					);
				});

				it("getPriceFeedAddress", async () => {
					assert.equal(
						await ethPriceFeedMock.getAddress(),
						await engine.getPriceFeedAddress(),
					);
				});

				it("getTotalCollateralDepositedForUser", async () => {
					erc20Mock.mint(deployer, MINT_AMOUNT);
					await erc20Mock.approve(engine, ONE_ETHER);

					await engine.depositCollateral(ONE_ETHER);
					assert.equal(
						ONE_ETHER,
						await engine.getCollateralDepositedForUser(deployer),
					);
				});

				it("getCscMintedForUser", async () => {});
			});
		});
