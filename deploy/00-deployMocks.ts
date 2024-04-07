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
		const ethErc20Mock = await deploy("ERC20Mock", {
			from: deployer,
			args: [],
			log: true,
		});
		const btcErc20Mock = await deploy("ERC20Mock", {
			from: deployer,
			args: [],
			log: true,
			// ! Check if should to deploy different contract???
			// skipIfAlreadyDeployed: false,
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
		/**
		 * ! Saving deployments of mocks so i can access them later in code,
		 * ! Because they use same contracts for deployment
		 */
		await deployments.save("EthERC20Mock", ethErc20Mock);
		await deployments.save("BtcERC20Mock", btcErc20Mock);
		await deployments.save("EthPriceFeedMock", ethPriceFeedMock);
		await deployments.save("BtcPriceFeedMock", btcPriceFeedMock);

		log("Mocks deployed!!!");
		log("===============================================================");
	}
};
export default func;
func.id = "00_deployMocks"; // id required to prevent re-execution
func.tags = ["mocks", "all"];
