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
import { Deployment } from "hardhat-deploy/types";

const isDevelopmentChain = developmentChains.includes(network.name);

!isDevelopmentChain
	? describe.skip
	: describe("Example Unit Tests", () => {
			const { deploy, log, getDeploymentsFromAddress } = deployments;
			const CHAIN_ID = network.config.chainId;
			const MINT_AMOUNT = ethers.parseEther("1111");
			const ONE_ETHER = ethers.parseEther("1");

			let ethErc20Mock: ERC20Mock;
			let btcErc20Mock: ERC20Mock;
			let ethPriceFeedMock: MockV3Aggregator;
			let btcPriceFeedMock: MockV3Aggregator;
			let stableCoin: StableCoin;
			let engine: SCEngine;

			beforeEach(async () => {
				await deployments.fixture(["all"]);
				// ! Test accounts provided by Hardhat
				// TODO Add another named account and access them with getNamedSigners
				const accounts: HardhatEthersSigner[] = await ethers.getSigners();
				const deployer = accounts[0];
				const player1 = accounts[1];
				const player2 = accounts[2];
				// ! Saved deployments from deploy script
				const ethErc20MockDeployment: Deployment =
					await deployments.get("EthERC20Mock");
				const btcErc20MockDeployment: Deployment =
					await deployments.get("BtcERC20Mock");
				const ethPriceFeedMockDeployment: Deployment =
					await deployments.get("EthPriceFeedMock");
				const btcPriceFeedMockDeployment: Deployment =
					await deployments.get("BtcPriceFeedMock");
				// ! Mocks
				// ! Be careful with type conversions!!!
				ethErc20Mock = (await ethers.getContractAt(
					"ERC20Mock",
					ethErc20MockDeployment.address,
				)) as unknown as ERC20Mock;
				btcErc20Mock = (await ethers.getContractAt(
					"ERC20Mock",
					btcErc20MockDeployment.address,
				)) as unknown as ERC20Mock;
				ethPriceFeedMock = (await ethers.getContractAt(
					"MockV3Aggregator",
					ethPriceFeedMockDeployment.address,
				)) as unknown as MockV3Aggregator;
				btcPriceFeedMock = (await ethers.getContractAt(
					"MockV3Aggregator",
					btcPriceFeedMockDeployment.address,
				)) as unknown as MockV3Aggregator;
				// ! Contracts
				stableCoin = await ethers.getContract("StableCoin");
				engine = await ethers.getContract("SCEngine");
			});

			describe("StableCoin Initialization", () => {
				it("Initializes correctly", async () => {
					const SC_NAME = await stableCoin.name();
					const SC_SYMBOL = await stableCoin.symbol();
					const REAL_OWNER = await stableCoin.owner();
					assert.equal(SC_NAME, "StableCoin");
					assert.equal(SC_SYMBOL, "SC");
					assert.equal(await engine.getAddress(), REAL_OWNER);
				});

				describe("StableCoin Burn Tests", () => {
					it("Revert if 0 amount", async () => {
						await expect(stableCoin.burn(0)).to.be.revertedWithCustomError(
							stableCoin,
							"StableCoin__MustBeMoreThanZero",
						);
					});

					it("Revert if exceeds balance", async () => {
						// TODO finish tests
					});
				});

				describe("StableCoin Mint Tests", () => {
					it("Example", async () => {
						// TODO
						assert.equal(1, 1);
					});
				});
			});

			describe("SCEngine Constructor Tests", () => {
				it("StableCoin Address Test", async () => {
					// TODO
					assert.equal(1, 1);
				});
			});
		});
