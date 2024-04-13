import { network, ethers, getNamedAccounts, deployments } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert, expect } from "chai";

import {
	BTC_USD_PRICE,
	DECIMALS,
	ETH_USD_PRICE,
	PRECISION_18,
	PRECISION_8,
	developmentChains,
} from "../../utils/helper.config";
import {
	ERC20Mock,
	MockV3Aggregator,
	SCEngine,
	StableCoin,
} from "../../typechain-types";
import { Address, Deployment } from "hardhat-deploy/types";
import { ZeroAddress } from "ethers";

const isDevelopmentChain = developmentChains.includes(network.name);

!isDevelopmentChain
	? describe.skip
	: describe("Example Unit Tests", () => {
			const { deploy, log, getDeploymentsFromAddress } = deployments;
			const CHAIN_ID = network.config.chainId;
			const MINT_AMOUNT = ethers.parseEther("1111");
			const ONE_ETHER = ethers.parseEther("1");
			let accounts: HardhatEthersSigner[];
			let deployer: HardhatEthersSigner;
			let player1: HardhatEthersSigner;
			let player2: HardhatEthersSigner;

			let ethErc20Mock: ERC20Mock;
			let btcErc20Mock: ERC20Mock;
			let ethPriceFeedMock: MockV3Aggregator;
			let btcPriceFeedMock: MockV3Aggregator;
			let stableCoin: StableCoin;
			let engine: SCEngine;

			let mockAddresses: Address[];
			let priceFeedMockAddresses: Address[];

			beforeEach(async () => {
				await deployments.fixture(["all"]);
				// ! Test accounts provided by Hardhat
				// TODO Add another named account and access them with getNamedSigners
				accounts = await ethers.getSigners();
				deployer = accounts[0];
				player1 = accounts[1];
				player2 = accounts[2];
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

				mockAddresses = [
					await ethErc20Mock.getAddress(),
					await btcErc20Mock.getAddress(),
				];
				priceFeedMockAddresses = [
					await ethPriceFeedMock.getAddress(),
					await btcPriceFeedMock.getAddress(),
				];
			});

			// ! TESTS FOR StableCoin.sol
			describe("StableCoin", () => {
				it("Initializes correctly", async () => {
					const SC_NAME = await stableCoin.name();
					const SC_SYMBOL = await stableCoin.symbol();
					const REAL_OWNER = await stableCoin.owner();
					assert.equal(SC_NAME, "StableCoin");
					assert.equal(SC_SYMBOL, "SC");
					assert.equal(await engine.getAddress(), REAL_OWNER);
				});

				describe("StableCoin Burn Tests", () => {
					// ! This should revert OwnableUnauthorizedAccount - from notOwner modifier ???
					it("Revert if 0 amount", async () => {
						await expect(stableCoin.burn(0)).to.be.revertedWithCustomError(
							stableCoin,
							"StableCoin__MustBeMoreThanZero",
						);
					});

					it("Revert if exceeds balance", async () => {
						await expect(stableCoin.burn(1)).to.be.revertedWithCustomError(
							stableCoin,
							"StableCoin__BurnAmountExceedsBalance",
						);
					});

					it("Burns successfully", async () => {
						// TODO
						assert.equal(1, 1);
					});
				});

				describe("StableCoin Mint Tests", () => {
					it("Example", async () => {
						// TODO
						assert.equal(1, 1);
					});
				});
			});

			// ! TESTS FOR SCEngine.sol
			describe("SCEngine Initialization Tests", () => {
				it("StableCoin Address Test", async () => {
					assert.equal(
						await engine.getSCAddress(),
						await stableCoin.getAddress(),
					);
				});

				it("Collateral Addresses Test", async () => {
					const mockAddresses = [
						await ethErc20Mock.getAddress(),
						await btcErc20Mock.getAddress(),
					];
					const realContractAddresses =
						await engine.getCollateralTokensAddresses();
					for (let i = 0; i < mockAddresses.length; i++) {
						assert.equal(realContractAddresses[i], mockAddresses[i]);
					}
				});

				it("PriceFeed Test", async () => {
					for (let i = 0; i < mockAddresses.length; i++) {
						assert.equal(
							priceFeedMockAddresses[i],
							await engine.getPriceFeedAddress(mockAddresses[i]),
						);
					}
				});

				it("Different length revert Test", async () => {
					const SCEngine = await ethers.getContractFactory("SCEngine");
					await expect(
						SCEngine.deploy(
							[mockAddresses[0]],
							priceFeedMockAddresses,
							await stableCoin.getAddress(),
						),
					).to.be.revertedWithCustomError(
						SCEngine,
						"SCEngine__TokenAddressesAndPriceFeedAddressesNotSameLength",
					);
				});
			});

			describe("getUSDValue Tests", () => {
				it("ETH_ERC20Mock test", async () => {
					const TEN_ETHER = parseInt(ONE_ETHER.toString()) * 10;
					const expectedValue =
						(TEN_ETHER * ETH_USD_PRICE) / PRECISION_18 / PRECISION_8;
					const amount = await engine.getUSDValue(ethErc20Mock, 10);
					assert.equal(amount, BigInt(expectedValue));
				});

				it("BTC_ERC20Mock test", async () => {
					const TEN_ETHER = parseInt(ONE_ETHER.toString()) * 10;
					const expectedValue =
						(TEN_ETHER * BTC_USD_PRICE) / PRECISION_18 / PRECISION_8;
					const amount = await engine.getUSDValue(btcErc20Mock, 10);
					assert.equal(amount, BigInt(expectedValue));
				});
			});

			describe("depositCollateral tests", () => {
				it("Should Revert if 0 amount", async () => {
					await expect(
						engine.depositCollateral(ethErc20Mock, 0),
					).to.be.revertedWithCustomError(
						engine,
						"SCEngine__NeedsMoreThanZero",
					);
				});

				it("Should revert if token not allowed", async () => {
					await expect(engine.depositCollateral(ZeroAddress, ONE_ETHER))
						.to.be.revertedWithCustomError(engine, "SCEngine__NotAllowedToken")
						.withArgs(ZeroAddress);
				});

				it("Reverts if user doesn't have enough wETH balance", async () => {
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await expect(engine.depositCollateral(ethErc20Mock, ONE_ETHER))
						.to.be.revertedWithCustomError(
							ethErc20Mock,
							"ERC20InsufficientBalance",
						)
						// ! Sender, balance of sender, amount to transfer
						.withArgs(deployer, 0, ONE_ETHER);
				});

				it("Reverts if user doesn't approve engine contract", async () => {
					await expect(engine.depositCollateral(ethErc20Mock, ONE_ETHER))
						.to.be.revertedWithCustomError(
							ethErc20Mock,
							"ERC20InsufficientAllowance",
						)
						.withArgs(await engine.getAddress(), 0, ONE_ETHER);
				});

				it("Reverts if engine tries to deposit more than allowed", async () => {
					ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await expect(
						engine.depositCollateral(ethErc20Mock, BigInt(2) * ONE_ETHER),
					)
						.to.be.revertedWithCustomError(
							ethErc20Mock,
							"ERC20InsufficientAllowance",
						)
						.withArgs(
							await engine.getAddress(),
							ONE_ETHER,
							BigInt(2) * ONE_ETHER,
						);
				});

				it("Adds collateral to s_collateralDeposited", async () => {
					ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await engine.depositCollateral(ethErc20Mock, ONE_ETHER);
					assert.equal(
						ONE_ETHER,
						await engine.getOneCollateralDeposited(
							deployer,
							await ethErc20Mock.getAddress(),
						),
					);
				});

				it("Emits the event", async () => {
					// emit CollateralDeposited(msg.sender, _tokenCollateralAddress, _amountCollateral);
					ethErc20Mock.mint(deployer, ONE_ETHER);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await expect(await engine.depositCollateral(ethErc20Mock, ONE_ETHER))
						.to.emit(engine, "CollateralDeposited")
						.withArgs(deployer, ethErc20Mock, ONE_ETHER);
				});
			});

			describe("getAccountCollateralValue tests", () => {
				it("calculates ETH test", async () => {
					ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);

					await engine.depositCollateral(ethErc20Mock, ONE_ETHER);
					const accCollateralValueInUSD =
						await engine.getAccountCollateralValueInUSD(deployer);
					const ONE_ETHER_IN_USD =
						(ONE_ETHER * BigInt(ETH_USD_PRICE)) / BigInt(PRECISION_8);
					assert.equal(ONE_ETHER_IN_USD, accCollateralValueInUSD);
				});
			});
		});
