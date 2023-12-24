import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, ethers, deployments, network } = hre;
	const { deployer } = await getNamedAccounts();
	const { deploy, log } = deployments;

	const stableCoin = await deploy("StableCoin", {
		from: deployer,
		args: [], // ! constructor args
		log: true,
	});

	log(`StableCoin contract: `, stableCoin.address);
};
export default func;
func.id = "deploy_stableCoin"; // id required to prevent re-execution
func.tags = ["stableCoin", "all"];
