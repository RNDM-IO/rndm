import { IERC20Metadata } from "../typechain-types";

export const POOL_REGISTRY_ID = "PoolRegistry";
export const WITHDRAW_MANAGER_ID = "WithdrawManager";
export const SECONDARY_REWARD_ID = "SECONDARY_REWARD";

export const CURVED_VESTING_ID = "CurvedVesting";
export const TESTNET_ASSET_ID = "TestnetAsset";
export const WRAPPED_NATIVE_ID = "WrappedNativeToken";
export const ROUTER_ID = "Router";

export const getAgentPoolId = async (asset: IERC20Metadata, label: string) => {
  return `${await asset.symbol()}-${label}`;
};
