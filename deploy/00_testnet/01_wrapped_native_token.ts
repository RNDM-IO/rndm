import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { WRAPPED_NATIVE_ID } from "../../helpers/deploy-ids";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";
import { isProduction } from "../../helpers/chain-config-helpers";

const func: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  ethers,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!isProduction()) {
    await deploy(WRAPPED_NATIVE_ID, {
      contract: "NativeWrapperMock",
      from: deployer,
      args: ["WRAPPED_ETH", "WETH"],
      ...COMMON_DEPLOY_PARAMS,
    });
    return;
  }
};

func.id = "WrappedNativeToken";
func.tags = ["periphery", "WrappedNativeToken", "init-testnet"];
func.dependencies = [];

export default func;
