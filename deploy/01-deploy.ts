import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, ethers, deployments, network } = hre;
	const { deployer } = await getNamedAccounts();
	const { deploy, log } = deployments;

	const example = await deploy("Example", {
		from: deployer,
		args: [], // ! constructor args
		log: true,
	});

	log(`Example contract: `, example.address);
};
export default func;
func.id = "deploy_example"; // id required to prevent re-execution
func.tags = ["example", "all"];
