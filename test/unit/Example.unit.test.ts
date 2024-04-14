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
				// TODO Why do i need this???
				stableCoin.transferOwnership(engine);

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
					it("Reverts because notOwner", async () => {
						await expect(stableCoin.burn(1)).to.be.revertedWithCustomError(
							stableCoin,
							"OwnableUnauthorizedAccount",
						);
					});

					// it("Revert if 0 amount", async () => {
					// 	await expect(stableCoin.burn(0)).to.be.revertedWithCustomError(
					// 		stableCoin,
					// 		"StableCoin__MustBeMoreThanZero",
					// 	);
					// });

					// it("Revert if exceeds balance", async () => {
					// 	await expect(stableCoin.burn(1)).to.be.revertedWithCustomError(
					// 		stableCoin,
					// 		"StableCoin__BurnAmountExceedsBalance",
					// 	);
					// });

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

			// TODO ORDER TESTS IN THIS ORDER
			// ! External, public, internal, private, view & pure

			describe("getUSDValue Tests", () => {
				it("ETH_ERC20Mock test", async () => {
					const AMOUNT = 10;
					const expectedValue = (AMOUNT * ETH_USD_PRICE) / PRECISION_8;
					const realValue = await engine.getUSDValue(ethErc20Mock, AMOUNT);
					assert.equal(realValue, BigInt(expectedValue));
				});

				it("BTC_ERC20Mock test", async () => {
					const AMOUNT = 10;
					const expectedValue = (AMOUNT * BTC_USD_PRICE) / PRECISION_8;
					const realValue = await engine.getUSDValue(btcErc20Mock, AMOUNT);
					assert.equal(realValue, BigInt(expectedValue));
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

			// describe("getTokenAmountFromUSD", () => {
			// 	it("calculates amount of tokens for USD", async () => {
			// 		const AMOUNT_USD = 100;
			// 		const expectedAmount =
			// 			(AMOUNT_USD * 1e18 * PRECISION_8) / ETH_USD_PRICE;
			// 		const realAmount = await engine.getTokenAmountFromUSD(
			// 			await ethErc20Mock.getAddress(),
			// 			AMOUNT_USD,
			// 		);
			// 		assert.equal(expectedAmount, parseFloat(realAmount.toString()));
			// 	});
			// });

			describe("mintSC tests", () => {
				it("revert if amount is 0", async () => {
					await expect(engine.mintSC(0)).to.be.revertedWithCustomError(
						engine,
						"SCEngine__NeedsMoreThanZero",
					);
				});

				it("reverts if health factor is broken", async () => {
					await expect(engine.mintSC(1))
						.to.be.revertedWithCustomError(
							engine,
							"SCEngine__BreaksHealthFactor",
						)
						.withArgs(0);
				});

				it("reverts if health factor is with health factor amount", async () => {
					ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await engine.depositCollateral(ethErc20Mock, ONE_ETHER);
					const ZERO_POINT_FIVE = 0.5 * 1e18;
					await expect(engine.mintSC(4000))
						.to.be.revertedWithCustomError(
							engine,
							"SCEngine__BreaksHealthFactor",
						)
						.withArgs(BigInt(ZERO_POINT_FIVE));
				});

				it("mint successfully and stores in s_SCMinted", async () => {
					ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await engine.depositCollateral(ethErc20Mock, ONE_ETHER);
					const THOUSAND = 1000;
					await engine.mintSC(THOUSAND);

					assert.equal(
						await engine.getSCMintedForAccount(deployer),
						BigInt(THOUSAND),
					);
				});

				it("mint successfully and emits SCMinted event", async () => {
					ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await engine.depositCollateral(ethErc20Mock, ONE_ETHER);
					const THOUSAND = 1000;
					await expect(engine.mintSC(THOUSAND))
						.to.emit(engine, "StableCoinMinted")
						.withArgs(deployer, THOUSAND);
				});
			});

			describe("depositCollateralAndMintSC", () => {
				it("Successfully deposits collateral and mints SC", async () => {
					const THOUSAND = BigInt(1000);
					ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await engine.depositCollateralAndMintSC(
						ethErc20Mock,
						ONE_ETHER,
						THOUSAND,
					);
					const userInfo = await engine.getAccountInformation(deployer);
					assert.equal(userInfo[0], THOUSAND);
					assert.equal(
						userInfo[1],
						(ONE_ETHER * BigInt(ETH_USD_PRICE)) / BigInt(PRECISION_8),
					);
				});
			});

			describe("burnSC tests", () => {
				it("should revert if amount is 0", async () => {
					await expect(engine.burnSC(0)).to.be.revertedWithCustomError(
						engine,
						"SCEngine__NeedsMoreThanZero",
					);
				});

				it("should revert if burning more than he has", async () => {
					await expect(engine.burnSC(10)).to.be.revertedWithPanic(0x11);
				});

				it("revert when doesn't have allowance", async () => {
					await ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					const ONE_HUNDRED = 100;
					await engine.depositCollateralAndMintSC(
						ethErc20Mock,
						ONE_ETHER,
						ONE_HUNDRED,
					);
					await expect(engine.burnSC(ONE_HUNDRED))
						.to.be.revertedWithCustomError(
							stableCoin,
							"ERC20InsufficientAllowance",
						)
						.withArgs(await engine.getAddress(), 0, ONE_HUNDRED);
				});

				it("revert when doesn't have enough allowance", async () => {
					await ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					const ONE_HUNDRED = 100;
					const ALLOWANCE_AMOUNT = 50;
					await engine.depositCollateralAndMintSC(
						ethErc20Mock,
						ONE_ETHER,
						ONE_HUNDRED,
					);
					await stableCoin.approve(engine, ALLOWANCE_AMOUNT);
					await expect(engine.burnSC(ONE_HUNDRED))
						.to.be.revertedWithCustomError(
							stableCoin,
							"ERC20InsufficientAllowance",
						)
						.withArgs(await engine.getAddress(), ALLOWANCE_AMOUNT, ONE_HUNDRED);
				});

				it("burns successfully and updates s_SCMinted", async () => {
					await ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					const ONE_HUNDRED = 100;
					const BURN_AMOUNT = 10;
					await engine.depositCollateralAndMintSC(
						ethErc20Mock,
						ONE_ETHER,
						ONE_HUNDRED,
					);
					await stableCoin.approve(engine, ONE_HUNDRED);
					await engine.burnSC(BURN_AMOUNT);
					assert.equal(
						await engine.getSCMintedForAccount(deployer),
						BigInt(ONE_HUNDRED - BURN_AMOUNT),
					);
				});

				it("burns successfully and emits event", async () => {
					await ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					const ONE_HUNDRED = 100;
					await engine.depositCollateralAndMintSC(
						ethErc20Mock,
						ONE_ETHER,
						ONE_HUNDRED,
					);
					await stableCoin.approve(engine, ONE_HUNDRED);
					await expect(engine.burnSC(ONE_HUNDRED))
						.to.emit(engine, "StableCoinBurned")
						.withArgs(ONE_HUNDRED, deployer.address, deployer.address);
				});
			});

			describe("redeemCollateral tests", () => {
				it("reverts if amount is not > 0", async () => {
					await expect(
						engine.redeemCollateral(ethErc20Mock, 0),
					).to.be.revertedWithCustomError(
						engine,
						"SCEngine__NeedsMoreThanZero",
					);
				});

				it("tries to redeem more than available", async () => {
					await expect(
						engine.redeemCollateral(ethErc20Mock, 100),
					).to.be.revertedWithPanic(0x11);
				});

				it("reverts if health factor is broken", async () => {
					await ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await stableCoin.approve(engine, 100);
					await engine.depositCollateralAndMintSC(ethErc20Mock, ONE_ETHER, 100);
					await expect(engine.redeemCollateral(ethErc20Mock, ONE_ETHER))
						.to.be.revertedWithCustomError(
							engine,
							"SCEngine__BreaksHealthFactor",
						)
						.withArgs(0);
				});

				it("redeems and updates s_collateralDeposited", async () => {
					await ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await engine.depositCollateral(ethErc20Mock, ONE_ETHER);
					await engine.redeemCollateral(ethErc20Mock, ONE_ETHER / BigInt(2));
					const info = await engine.getOneCollateralDeposited(
						deployer,
						ethErc20Mock,
					);
					assert.equal(ONE_ETHER / BigInt(2), info);
				});

				it("redeems and emits event", async () => {
					await ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await engine.depositCollateral(ethErc20Mock, ONE_ETHER);
					await expect(
						engine.redeemCollateral(ethErc20Mock, ONE_ETHER / BigInt(2)),
					)
						.to.emit(engine, "CollateralRedeemed")
						.withArgs(deployer, deployer, ethErc20Mock, ONE_ETHER / BigInt(2));
				});
			});

			describe("burnSCAndRedeemCollateral tests", () => {
				it("reverts when health factor is broken", async () => {
					await ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await stableCoin.approve(engine, 100);
					await engine.depositCollateralAndMintSC(ethErc20Mock, ONE_ETHER, 100);
					await expect(
						engine.burnSCAndRedeemCollateral(ethErc20Mock, ONE_ETHER, 10),
					)
						.to.be.revertedWithCustomError(
							engine,
							"SCEngine__BreaksHealthFactor",
						)
						.withArgs(0);
				});

				it("reverts when burning more than it have", async () => {
					await ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await stableCoin.approve(engine, 100);
					await engine.depositCollateralAndMintSC(ethErc20Mock, ONE_ETHER, 100);
					await expect(
						engine.burnSCAndRedeemCollateral(ethErc20Mock, ONE_ETHER, 1000),
					).to.be.revertedWithPanic(0x11);
				});

				it("works", async () => {
					await ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, ONE_ETHER);
					await stableCoin.approve(engine, 100);
					await engine.depositCollateralAndMintSC(ethErc20Mock, ONE_ETHER, 100);
					await engine.burnSCAndRedeemCollateral(ethErc20Mock, ONE_ETHER, 100);
					const info = await engine.getAccountInformation(deployer);
					assert.equal(info[0], BigInt(0));
					assert.equal(info[1], BigInt(0));
				});
			});

			describe("LIQUIDATE", () => {
				it("reverts if not more than zero", async () => {
					await expect(
						engine.liquidate(ethErc20Mock, player1, 0),
					).to.be.revertedWithCustomError(
						engine,
						"SCEngine__NeedsMoreThanZero",
					);
				});

				it("reverts if user has ok health factor", async () => {
					await expect(
						engine.liquidate(ethErc20Mock, player1, 10),
					).to.be.revertedWithCustomError(
						engine,
						"SCEngine__HealthFactorIsFine",
					);
				});

				it("revert if health factor has not improved", async () => {
					// ! deployer and player to deposit and mint SC
					// ! change price
					// ! Liquidate one
					const TEN_ETH = ethers.parseEther("10");

					await ethErc20Mock.mint(player1, MINT_AMOUNT);
					await ethErc20Mock.connect(player1).approve(engine, TEN_ETH);
					await stableCoin.connect(player1).approve(engine, 10000);
					await engine
						.connect(player1)
						.depositCollateralAndMintSC(ethErc20Mock, TEN_ETH, 10000);

					await ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, MINT_AMOUNT);
					await engine.depositCollateralAndMintSC(
						ethErc20Mock,
						MINT_AMOUNT,
						1000,
					);
					console.log(await ethPriceFeedMock.latestRoundData());
					await ethPriceFeedMock.updateAnswer(1000);

					await stableCoin.approve(engine, 10000);
					await expect(
						engine.liquidate(ethErc20Mock, player1, 100),
					).to.be.revertedWithCustomError(
						engine,
						"SCEngine__HealthFactorNotImproved",
					);
				});

				it("liquidates successfully", async () => {
					// ! deployer and player to deposit and mint SC
					// ! change price
					// ! Liquidate one
					const TEN_ETH = ethers.parseEther("10");
					const MINT_PLAYER = 10000;
					const NEW_PRICE = 1000e8;
					// ! Deposit and mint for player
					await ethErc20Mock.mint(player1, MINT_AMOUNT);
					await ethErc20Mock.connect(player1).approve(engine, TEN_ETH);
					await stableCoin.connect(player1).approve(engine, MINT_PLAYER);
					await engine
						.connect(player1)
						.depositCollateralAndMintSC(ethErc20Mock, TEN_ETH, MINT_PLAYER);

					// ! Deposit and mint for deployer
					await ethErc20Mock.mint(deployer, MINT_AMOUNT);
					await ethErc20Mock.approve(engine, MINT_AMOUNT);
					await engine.depositCollateralAndMintSC(
						ethErc20Mock,
						MINT_AMOUNT,
						MINT_PLAYER,
					);
					// ! Change price
					await ethPriceFeedMock.updateAnswer(NEW_PRICE);
					await stableCoin.approve(engine, MINT_PLAYER);
					await engine.liquidate(ethErc20Mock, player1, MINT_PLAYER);
					const info = await engine.getAccountInformation(player1);
					console.log("player", info);
					assert.equal(info[0], BigInt(0));
				});
			});
		});
