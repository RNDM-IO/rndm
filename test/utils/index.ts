import { BaseContract, ZeroAddress } from "ethers";
import { IERC20Metadata, AggregatorV3Interface } from "../../typechain-types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

declare var hre: HardhatRuntimeEnvironment;

export async function setupUsers<
  T extends { [contractName: string]: BaseContract },
>(addresses: string[], contracts: T): Promise<({ address: string } & T)[]> {
  const users: ({ address: string } & T)[] = [];
  for (const address of addresses) {
    users.push(await setupUser(address, contracts));
  }
  return users;
}

export async function setupUser<
  T extends { [contractName: string]: BaseContract },
>(address: string, contracts: T): Promise<{ address: string } & T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = { address };
  for (const key of Object.keys(contracts)) {
    user[key] = contracts[key].connect(await hre.ethers.getSigner(address));
  }
  return user as { address: string } & T;
}

export const getTokenInfo = async (
  token: IERC20Metadata,
  oracle: AggregatorV3Interface
) => {
  return {
    tokenAddress: token.target,
    priceOracle: oracle.target,
    decimals: await token.decimals(),
  };
};

export const getAgentPoolTokenInfo = async (token: IERC20Metadata) => {
  return {
    tokenAddress: await token.target,
    priceOracle: ZeroAddress,
    decimals: await token.decimals(),
  };
};
