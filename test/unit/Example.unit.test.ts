import { network, ethers, getNamedAccounts, deployments } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert, expect } from "chai";

import { developmentChains } from "../../utils/helper.config";

const isDevelopmentChain = developmentChains.includes(network.name);
console.log("unit test");

!isDevelopmentChain
	? describe.skip
	: describe("Example Unit Tests", () => {
			beforeEach(async () => {
				// ! Do some code here
			});

			describe("Constructor Tests", () => {
				it("Example test", async () => {
					assert.equal(1, 1);
				});
			});
	  });
