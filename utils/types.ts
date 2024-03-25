export type NetworkConfigItem = {
	wEthAddress: string;
	wEthUsdPriceFeed: string;
	wBtcAddress: string;
	wBtcUsdPriceFeed: string;
};

export type NetworkConfig = {
	[key: number]: NetworkConfigItem;
};
