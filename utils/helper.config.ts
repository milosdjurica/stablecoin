import { NetworkConfig } from "./types";

export const developmentChains = ["hardhat", "localhost", "ganache"];
export const DECIMALS = 8;
export const ETH_USD_PRICE = 4000e8;
export const BTC_USD_PRICE = 60000e8;

export let networkConfig: NetworkConfig = {
	// SEPOLIA
	11155111: {
		wEthAddress: "0xdd13e55209fd76afe204dbda4007c227904f0a81",
		wEthUsdPriceFeed: "0x694aa1769357215de4fac081bf1f309adc325306",
		wBtcUsdPriceFeed: "0x1b44f3514812d835eb1bdb0acb33d3fa3351ee43",
		wBtcAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
	},
};
