import { task } from "hardhat/config";
import { getAgentPool } from "../../helpers/contract-getters";
import { EventLog } from "ethers";

task("agent-admin:set-supply-cap", "set supply cap of the pool")
  .addParam("asset", "asset address")
  .addParam("label", "name of the engine")
  .addParam("amount", "limit amount in units")
  .setAction(async ({ asset, label, amount }, { ethers, run }) => {
    const [deployer] = await ethers.getSigners();

    const pool = await getAgentPool(asset, label);
    const depositToken = await ethers.getContractAt("ERC20", asset);
    const decimals = await depositToken.decimals();
    amount = ethers.parseUnits(amount, decimals);

    await pool.connect(deployer).setSupplyCap(amount);

    await run("review-agent-pool", { asset, label });
  });

task(
  "agent-admin:set-supply-cap-per-address",
  "set supply cap per address of the pool"
)
  .addParam("asset", "asset address")
  .addParam("label", "name of the engine")
  .addParam("amount", "limit amount in units")
  .setAction(async ({ asset, label, amount }, { ethers, run }) => {
    const [deployer] = await ethers.getSigners();

    const pool = await getAgentPool(asset, label);
    const depositToken = await ethers.getContractAt("ERC20", asset);
    const decimals = await depositToken.decimals();
    amount = ethers.parseUnits(amount, decimals);

    await pool.connect(deployer).setSupplyCapPerAddress(amount);

    await run("review-agent-pool", { asset, label });
  });

task("agent-admin:set-min-repay-bips", "set minimum repay bips of the pool")
  .addParam("asset", "asset address")
  .addParam("label", "name of the engine")
  .addParam("bips", "minimum repay bips")
  .setAction(async ({ asset, label, bips }, { ethers, run }) => {
    const [deployer] = await ethers.getSigners();

    const pool = await getAgentPool(asset, label);

    await pool.connect(deployer).setMinRepayBips(bips);

    await run("review-agent-pool", { asset, label });
  });

task(
  "agent-admin:grant-borrower-role",
  "Grant borrower role of pool manager to the address"
)
  .addParam("to", "address to grant role")
  .addParam("asset", "asset address")
  .addParam("label", "name of the engine")
  .setAction(async ({ to, asset, label }, { ethers }) => {
    const [deployer] = await ethers.getSigners();

    const pool = await getAgentPool(asset, label);
    const BORROWER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BORROWER_ROLE"));
    const tx = await pool.connect(deployer).grantRole(BORROWER_ROLE, to);
    const receipt = await tx.wait();
    const event = receipt!.logs.find(
      (e) => e instanceof EventLog && e.eventName === "RoleGranted"
    );
    if (event && event instanceof EventLog) {
      console.log(event.args);
    }
  });

task(
  "agent-admin:revoke-borrower-role",
  "Revoke borrower role of pool manager to the address"
)
  .addParam("borrower", "address to revoke role")
  .addParam("asset", "asset address")
  .addParam("label", "name of the engine")
  .setAction(async ({ borrower, asset, label }, { ethers }) => {
    const [deployer] = await ethers.getSigners();

    const pool = await getAgentPool(asset, label);
    const BORROWER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BORROWER_ROLE"));
    const tx = await pool.connect(deployer).revokeRole(BORROWER_ROLE, borrower);
    const receipt = await tx.wait();
    const event = receipt!.logs.find(
      (e) => e instanceof EventLog && e.eventName === "RoleRevoked"
    );
    if (event && event instanceof EventLog) {
      console.log(event.args);
    }
  });
