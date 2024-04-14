import { Address, DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../utils/helper.config";
import { StableCoin } from "../typechain-types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { getNamedAccounts, ethers, deployments, network } = hre;
	const { deployer, player } = await getNamedAccounts();
	const { deploy, log } = deployments;

	const CHAIN_ID = network.config.chainId!!!!!;
	const IS_DEV_CHAIN = developmentChains.includes(network.name);
	let wEthAddress: Address;
	let wEthPriceFeedAddress: Address;
	let wBtcAddress: Address;
	let wBtcPriceFeedAddress: Address;

	if (IS_DEV_CHAIN) {
		wEthAddress = (await deployments.get("EthERC20Mock")).address;
		wBtcAddress = (await deployments.get("BtcERC20Mock")).address;
		wEthPriceFeedAddress = (await deployments.get("EthPriceFeedMock")).address;
		wBtcPriceFeedAddress = (await deployments.get("BtcPriceFeedMock")).address;
	} else {
		wEthAddress = networkConfig[CHAIN_ID].wEthAddress;
		wBtcAddress = networkConfig[CHAIN_ID].wBtcAddress;
		wEthPriceFeedAddress = networkConfig[CHAIN_ID].wEthUsdPriceFeed;
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
	// console.log(ENGINE_CONSTRUCTOR_ARGS);
	const scEngine = await deploy("SCEngine", {
		from: deployer,
		args: ENGINE_CONSTRUCTOR_ARGS,
		log: true,
	});
	const stableCoin: StableCoin = await ethers.getContract(
		"StableCoin",
		deployer,
	);

	// TODO Does this work and why shows different in tests???
	stableCoin.transferOwnership(scEngine.address);
};
export default func;
func.id = "01_deploy"; // id required to prevent re-execution
func.tags = ["stablecoin", "all"];
