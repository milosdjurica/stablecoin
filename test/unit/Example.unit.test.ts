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

			const { deploy, log, getDeploymentsFromAddress } = deployments;

			beforeEach(async () => {
				await deployments.fixture(["all"]);
				// ! Test accounts provided by Hardhat
				const accounts: HardhatEthersSigner[] = await ethers.getSigners();
				const deployer = accounts[0];
				const player1 = accounts[1];
				const player2 = accounts[2];

				console.log("player", player1.address);
				const ethErc20Mock: ERC20Mock = await ethers.getContract(
					"ERC20Mock",
					deployer,
				);
				const btcErc20Mock: ERC20Mock = await ethers.getContract(
					"ERC20Mock",
					player1,
				);
				const ethPriceFeedMock: MockV3Aggregator = await ethers.getContract(
					"MockV3Aggregator",
					deployer,
				);
				const btcPriceFeedMock: MockV3Aggregator = await ethers.getContract(
					"MockV3Aggregator",
					player1,
				);
				const stableCoin: StableCoin = await ethers.getContract("StableCoin");
				const engine: SCEngine = await ethers.getContract("SCEngine");

				console.log(await ethErc20Mock.getAddress());
				console.log(await btcErc20Mock.getAddress());
				console.log(await ethPriceFeedMock.getAddress());
				console.log(await btcPriceFeedMock.getAddress());
				console.log(await stableCoin.getAddress());
				console.log(await engine.getAddress());

				// TODO maybe its better to instantly take only addresses
				// const accounts1 = await getNamedAccounts();
				// const deployerAddr = (await getNamedAccounts()).deployer;
				// console.log(deployer, player1, player2);
				// console.log("accounts", accounts);
				// console.log(accounts1);
				// TODO Change this to get correct contract, and because now it gets just first/last updated
			});

			describe("Constructor Tests", () => {
				it("Example test", async () => {
					assert.equal(1, 1);
				});
			});
		});
