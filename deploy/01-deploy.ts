import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../utils/helper.config";
import { StableCoin, ERC20Mock, MockV3Aggregator } from "../typechain-types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, ethers, deployments, network } = hre;
	const { deployer } = await getNamedAccounts();
	const { deploy, log } = deployments;

	const CHAIN_ID = network.config.chainId!;
	const IS_DEV_CHAIN = developmentChains.includes(network.name);
	let wEthAddress;
	let wEthPriceFeedAddress;
	let wBtcAddress;
	let wBtcPriceFeedAddress;

	if (IS_DEV_CHAIN) {
		let erc20Mock: ERC20Mock = await ethers.getContract("ERC20Mock");

		let ethPriceFeedMock: MockV3Aggregator =
			await ethers.getContract("MockV3Aggregator");
		let btcPriceFeedMock: MockV3Aggregator =
			await ethers.getContract("MockV3Aggregator");

		wEthAddress = await erc20Mock.getAddress();
		wEthPriceFeedAddress = await ethPriceFeedMock.getAddress();
		wBtcPriceFeedAddress = await ethPriceFeedMock.getAddress();
	} else {
		wEthAddress = networkConfig[CHAIN_ID].wEthAddress;
		wEthPriceFeedAddress = networkConfig[CHAIN_ID].wEthUsdPriceFeed;
		wBtcAddress = networkConfig[CHAIN_ID].wBtcAddress;
		wBtcPriceFeedAddress = networkConfig[CHAIN_ID].wBtcUsdPriceFeed;
	}

	const stableCoinDeploy = await deploy("StableCoin", {
		from: deployer,
		args: [], // ! constructor args
		log: true,
	});
	const SC_ADDRESS = stableCoinDeploy.address;

	const ENGINE_CONSTRUCTOR_ARGS = [
		[wEthAddress, wBtcAddress],
		[wEthPriceFeedAddress, wBtcPriceFeedAddress],
		SC_ADDRESS,
	];

	const scEngine = await deploy("SCEngine", {
		from: deployer,
		args: ENGINE_CONSTRUCTOR_ARGS,
		log: true,
	});

	const stableCoin: StableCoin = await ethers.getContract(
		"StableCoin",
		deployer,
	);

	stableCoin.transferOwnership(scEngine.address);
};
export default func;
func.id = "01_deploy"; // id required to prevent re-execution
func.tags = ["stablecoin", "all"];
