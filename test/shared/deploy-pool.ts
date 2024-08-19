import { getNamedAccounts, deployments, ethers } from "hardhat";
import { getContract } from "../../helpers/contract-getters";

import { AgentPool } from "../../typechain-types/contracts/AgentPool";
import { AddressLike, Addressable, BigNumberish } from "ethers";
import { IPool } from "../../typechain-types/contracts/AgentPool";

export type PoolConfiguration = {
  supplyCap: BigInt;
  supplyCapPerAddress: BigInt;
  borrowCap: BigInt;
  performanceFee: BigInt;
  lockPeriod: BigInt;
};

export const deployAgentPool = async (params: IPool.InitPoolParamsStruct) => {
  const { deployer } = await getNamedAccounts();
  await deployments.deploy("AgentPool", {
    contract: "AgentPool",
    from: deployer,
    args: [params],
  });
  return await ethers.getContract<AgentPool>("AgentPool");
};
