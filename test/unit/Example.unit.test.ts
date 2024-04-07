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
				const ethErc20Mock = (await ethers.getContractAt(
					"ERC20Mock",
					ethErc20MockDeployment.address,
				)) as unknown as ERC20Mock;
				ethErc20Mock;
				const btcErc20Mock = (await ethers.getContractAt(
					"ERC20Mock",
					btcErc20MockDeployment.address,
				)) as unknown as ERC20Mock;
				const ethPriceFeedMock = (await ethers.getContractAt(
					"MockV3Aggregator",
					ethPriceFeedMockDeployment.address,
				)) as unknown as MockV3Aggregator;
				const btcPriceFeedMock = (await ethers.getContractAt(
					"MockV3Aggregator",
					btcPriceFeedMockDeployment.address,
				)) as unknown as MockV3Aggregator;
				// ! Contracts
				const stableCoin: StableCoin = await ethers.getContract("StableCoin");
				const engine: SCEngine = await ethers.getContract("SCEngine");
				// console.log(btcErc20Mock, engine);
				// console.log(await ethErc20Mock.getAddress());
				// console.log(await btcErc20Mock.getAddress());
				// console.log(await ethPriceFeedMock.getAddress());
				// console.log(await btcPriceFeedMock.getAddress());
				// console.log(await stableCoin.getAddress());
				// console.log(await engine.getAddress());

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
