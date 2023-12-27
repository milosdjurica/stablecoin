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
	let wEthPriceFeed;

	if (IS_DEV_CHAIN) {
		let erc20Mock: ERC20Mock = await ethers.getContract("ERC20Mock");
		console.log("erc20Mock ---> ", erc20Mock);

		let ethPriceFeedMock: MockV3Aggregator =
			await ethers.getContract("MockV3Aggregator");
		console.log("ethPriceFeedMock ---> ", ethPriceFeedMock);
	}

	const charityStableCoin = await deploy("CharityStableCoin", {
		from: deployer,
		args: [], // ! constructor args
		log: true,
	});

	log(`CharityStableCoin contract: `, charityStableCoin.address);
};

export default func;
func.id = "deploy_charityStableCoin"; // id required to prevent re-execution
func.tags = ["charityStableCoin", "all"];
