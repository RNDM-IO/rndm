import { BaseContract } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { AgentPool, MockERC20 } from "../typechain-types";
import { SECONDARY_REWARD_ID, getAgentPoolId } from "./deploy-ids";
declare var hre: HardhatRuntimeEnvironment;
export const getContract = async <ContractType extends BaseContract>(
  id: string,
  address?: string
): Promise<ContractType> => {
  const artifact = await hre.deployments.getArtifact(id);
  return hre.ethers.getContractAt(
    artifact.abi,
    address || (await hre.deployments.get(id)).address
  ) as any as ContractType;
};

export const getAgentPool = async (
  asset: string,
  label: string
): Promise<AgentPool> => {
  const Asset = await hre.ethers.getContractAt("IERC20Metadata", asset);
  const poolId = await getAgentPoolId(Asset, label);
  return await hre.ethers.getContract<AgentPool>(poolId);
};

export const getSecondaryReward = async (
  address?: string
): Promise<MockERC20> => getContract(SECONDARY_REWARD_ID, address);
