export const developmentChains = ["hardhat", "localhost", "ganache"];

export type NetworkConfigItem = {
	wEthAddress: string;
	wEthUsdPriceFeed: string;
};

export type NetworkConfig = {
	[key: number]: NetworkConfigItem;
};

export let networkConfig: NetworkConfig = {
	// SEPOLIA
	11155111: {
		wEthAddress: "0xdd13e55209fd76afe204dbda4007c227904f0a81",
		wEthUsdPriceFeed: "0x694aa1769357215de4fac081bf1f309adc325306",
	},
};
