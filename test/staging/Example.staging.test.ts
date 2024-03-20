import { network, ethers, getNamedAccounts, deployments } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert, expect } from "chai";

import { developmentChains } from "../../utils/helper.config";

const isDevelopmentChain = developmentChains.includes(network.name);

isDevelopmentChain
	? describe.skip
	: describe("Example Staging Tests", () => {
			beforeEach(async () => {
				console.log("STAGING TEST");
				// ! Do some code here
			});

			describe("Constructor Tests", () => {
				it("Example test", async () => {
					assert.equal(1, 1);
				});
			});
		});
