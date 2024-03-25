import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
	BTC_USD_PRICE,
	DECIMALS,
	ETH_USD_PRICE,
	developmentChains,
} from "../utils/helper.config";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, ethers, deployments, network } = hre;
	const { deployer } = await getNamedAccounts();
	const { deploy, log } = deployments;

	if (developmentChains.includes(network.name)) {
		console.log("Local network detected! Deploying mocks...");

		const erc20Mock = await deploy("ERC20Mock", {
			from: deployer,
			args: [],
			log: true,
		});

		const ethPriceFeedMock = await deploy("MockV3Aggregator", {
			from: deployer,
			args: [DECIMALS, ETH_USD_PRICE],
			log: true,
		});

		const btcPriceFeedMock = await deploy("MockV3Aggregator", {
			from: deployer,
			args: [DECIMALS, BTC_USD_PRICE],
			log: true,
		});

		log("Mocks deployed!!!");
		log("===============================================================");
	}
};
export default func;
func.id = "deploy_example"; // id required to prevent re-execution
func.tags = ["example", "all"];
