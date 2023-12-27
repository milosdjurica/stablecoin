import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../utils/helper.config";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, deployments, network } = hre;
	const { deployer } = await getNamedAccounts();
	const { deploy, log } = deployments;

	const DECIMALS = 8;
	const ETH_USD_PRICE = 2000e8;

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

		log("erc20Mock contract: ", erc20Mock.address);
		log("erc20Mock deployed!!!");
		log(`EthPriceFeedMock contract: `, ethPriceFeedMock.address);
		log("ETH price feed mock deployed!!!");
		log("===============================================================");
	}
};

export default func;
func.id = "deploy_mock"; // id required to prevent re-execution
func.tags = ["mock", "all"];
