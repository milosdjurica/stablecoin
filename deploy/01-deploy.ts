import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, ethers, deployments, network } = hre;
	const { deployer } = await getNamedAccounts();
	const { deploy, log } = deployments;

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
