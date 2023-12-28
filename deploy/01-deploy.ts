import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../utils/helper.config";
import { ERC20Mock, MockV3Aggregator } from "../typechain-types";
import { verify } from "../utils/verify";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, ethers, deployments, network } = hre;
	const { deployer } = await getNamedAccounts();
	const { deploy, log } = deployments;

	const CHAIN_ID = network.config.chainId!;

	const IS_DEV_CHAIN = developmentChains.includes(network.name);
	let wEthAddress;
	let wEthPriceFeedAddress;

	if (IS_DEV_CHAIN) {
		let erc20Mock: ERC20Mock = await ethers.getContract("ERC20Mock");

		let ethPriceFeedMock: MockV3Aggregator =
			await ethers.getContract("MockV3Aggregator");

		wEthAddress = await erc20Mock.getAddress();
		wEthPriceFeedAddress = await ethPriceFeedMock.getAddress();
	} else {
		wEthAddress = networkConfig[CHAIN_ID].wEthAddress;
		wEthPriceFeedAddress = networkConfig[CHAIN_ID].wEthUsdPriceFeed;
	}

	const charityStableCoin = await deploy("CharityStableCoin", {
		from: deployer,
		args: [], // ! constructor args
		log: true,
	});

	const CSC_ADDRESS = charityStableCoin.address;

	const ENGINE_CONSTRUCTOR_ARGS = [
		wEthAddress,
		wEthPriceFeedAddress,
		CSC_ADDRESS,
	];

	const cscEngine = await deploy("CSCEngine", {
		from: deployer,
		args: ENGINE_CONSTRUCTOR_ARGS,
		log: true,
	});

	if (!IS_DEV_CHAIN && process.env.ETHERSCAN_API_KEY) {
		console.log("Verifying contracts...");
		await verify(CSC_ADDRESS, []);
		await verify(cscEngine.address, ENGINE_CONSTRUCTOR_ARGS);
	}
};

export default func;
func.id = "deploy_charityStableCoin"; // id required to prevent re-execution
func.tags = ["charityStableCoin", "all"];
