import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NetworkConfigItem, developmentChains } from "../utils/helper.config";
import { ERC20Mock, MockV3Aggregator } from "../typechain-types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, ethers, deployments, network } = hre;
	const { deployer } = await getNamedAccounts();
	const { deploy, log } = deployments;

	const IS_DEV_CHAIN = developmentChains.includes(network.name);
	let wEthAddress;
	let wEthPriceFeedAddress;

	if (IS_DEV_CHAIN) {
		let erc20Mock: ERC20Mock = await ethers.getContract("ERC20Mock");
		// console.log("erc20Mock ---> ", erc20Mock);

		let ethPriceFeedMock: MockV3Aggregator =
			await ethers.getContract("MockV3Aggregator");
		// console.log("ethPriceFeedMock ---> ", ethPriceFeedMock);

		wEthAddress = await erc20Mock.getAddress();
		wEthPriceFeedAddress = await ethPriceFeedMock.getAddress();
		// console.log(
		// 	"ethPriceFeedMock data -> ",
		// 	await ethPriceFeedMock.latestRoundData(),
		// );
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

	console.log("ENGINE_CONSTRUCTOR_ARGS", ENGINE_CONSTRUCTOR_ARGS);

	const cscEngine = await deploy("CSCEngine", {
		from: deployer,
		args: ENGINE_CONSTRUCTOR_ARGS,
		log: true,
	});

	log(`CharityStableCoin contract: `, charityStableCoin.address);
};

export default func;
func.id = "deploy_charityStableCoin"; // id required to prevent re-execution
func.tags = ["charityStableCoin", "all"];
