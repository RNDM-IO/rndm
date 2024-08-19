import { task } from "hardhat/config";
import { getAgentPoolId } from "../helpers/deploy-ids";

task("create-agent-pool", "Create an agent pool")
  .addParam("asset", "asset address")
  .addParam("label", "name of the engine")
  .addParam("period", "Lock Period in seconds")
  .addParam("fee", "fee in bips")
  .setAction(async ({ asset, label, period: lockPeriod, fee }, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    const Asset = await hre.ethers.getContractAt("IERC20Metadata", asset);

    const underlyingSymbol = await Asset.symbol();
    const initPoolParams = {
      underlying: asset,
      name: label,
      tokenName: `VCRed ${hre.network.name} ${label} ${underlyingSymbol}`,
      tokenSymbol: `v${hre.network.name}${label}${underlyingSymbol}`,
      admin: deployer,
      feeCollector: deployer,
      performanceFee: fee,
      lockPeriod,
    };

    const poolId = await getAgentPoolId(Asset, label);
    await hre.deployments.deploy(poolId, {
      contract: "AgentPool",
      from: deployer,
      args: [initPoolParams],
    });

    const { address: contractAddress } = await hre.deployments.get(poolId);

    console.log("Agent pool deployed at:", contractAddress);
    // await hre.run("verify:verify", {
    //   address: contractAddress,
    //   constructorArguments: [initPoolParams],
    // });
  });
