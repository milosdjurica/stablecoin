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

		const ethMock = await deploy("MockV3Aggregator", {
			from: deployer,
			args: [DECIMALS, ETH_USD_PRICE],
			log: true,
		});

		log(`EthMock contract: `, ethMock.address);
		log("ETH price feed mock deployed!!!");
		log("===============================================================");
	}
};

export default func;
func.id = "deploy_mockV3Aggregator"; // id required to prevent re-execution
func.tags = ["mockV3Aggregator", "all"];
