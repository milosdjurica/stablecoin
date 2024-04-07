import { Address, DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
	BTC_USD_PRICE,
	DECIMALS,
	ETH_USD_PRICE,
	developmentChains,
	networkConfig,
} from "../utils/helper.config";
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
		console.log("Local network detected! Deploying mocks...");
		// ! TODO maybe deploy with different contracts (deployer, player, ...)
		const ethErc20Mock = await deploy("ERC20Mock", {
			from: deployer,
			args: [],
			log: true,
		});
		const btcErc20Mock = await deploy("ERC20Mock", {
			from: player,
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
			from: player,
			args: [DECIMALS, BTC_USD_PRICE],
			log: true,
			// skipIfAlreadyDeployed: false,
		});

		await deployments.save("EthERC20Mock", ethErc20Mock);
		await deployments.save("BtcERC20Mock", btcErc20Mock);
		await deployments.save("EthPriceFeedMock", ethPriceFeedMock);
		await deployments.save("BtcPriceFeedMock", btcPriceFeedMock);
		log("Mocks deployed!!!");
		log("===============================================================");

		wEthAddress = ethErc20Mock.address;
		wBtcAddress = btcErc20Mock.address;
		wEthPriceFeedAddress = ethPriceFeedMock.address;
		wBtcPriceFeedAddress = btcPriceFeedMock.address;
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

	stableCoin.transferOwnership(scEngine.address);
};
export default func;
func.id = "01_deploy"; // id required to prevent re-execution
func.tags = ["stablecoin", "all"];
