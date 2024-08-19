import { task } from "hardhat/config";
import { getAgentPool } from "../../helpers/contract-getters";

task("review-agent-pool", "review pool")
  .addParam("asset", "asset address")
  .addParam("label", "name of the engine")
  .setAction(async ({ asset, label }, hre) => {
    const pool = await getAgentPool(asset, label);

    console.log(`Pool address: ${await pool}`);
    console.log(`asset: ${asset}`);
    console.log(`label: ${label}`);
    console.log("Pool configuration");
    const {
      supplyCap,
      supplyCapPerAddress,
      borrowCap,
      performanceFee,
      lockPeriod,
    } = await pool.config();
    console.table({
      supplyCap,
      supplyCapPerAddress,
      borrowCap,
      performanceFee,
      lockPeriod,
    });

    console.log("Total Borrowed: " + (await pool.totalBorrowed()));
  });
