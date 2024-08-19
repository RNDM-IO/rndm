import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { TESTNET_ASSET_ID } from "../../helpers/deploy-ids";
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
    await deploy(TESTNET_ASSET_ID, {
      contract: "MockERC20",
      from: deployer,
      args: ["MockAsset", "MCA"],
      ...COMMON_DEPLOY_PARAMS,
    });

    return;
  }
};

func.id = "TOKEN_SETUP";

func.tags = ["token-setup", "init-testnet"];

export default func;
