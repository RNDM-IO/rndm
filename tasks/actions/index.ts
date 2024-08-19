import { task } from "hardhat/config";
import { getAgentPool } from "../../helpers/contract-getters";
import { waitForTx } from "../../helpers/utilities/tx";

task("agent-pool:deposit", "Deposit tokens to the pool")
  .addParam("asset", "asset address")
  .addParam("label", "name of the engine")
  .addParam("amount", "deposit amount")
  .setAction(async ({ asset, label, amount }, hre) => {
    const [, user] = await hre.ethers.getSigners();
    const pool = await getAgentPool(asset, label);

    const depositToken = await hre.ethers.getContractAt("ERC20", asset);
    const decimals = await depositToken.decimals();

    amount = hre.ethers.parseUnits(amount, decimals);
    await waitForTx(await depositToken.connect(user).approve(pool, amount));
    await waitForTx(await pool.connect(user).deposit(amount, user));

    const share = await pool.balanceOf(user);
    console.log(`share: ${share}`);

    await hre.run("review-agent-pool", { asset, label });
  });

task("agent-pool:withdraw", "withdraw from pool")
  .addParam("asset", "asset address")
  .addParam("label", "name of the engine")
  .addParam("amount", "deposit amount")
  .setAction(async ({ asset, label, amount }, { ethers, run }) => {
    const [, user] = await ethers.getSigners();

    const pool = await getAgentPool(asset, label);

    const depositToken = await ethers.getContractAt("ERC20", asset);
    const decimals = await depositToken.decimals();
    amount = ethers.parseUnits(amount, decimals);

    const balanceBefore = await depositToken.balanceOf(user);
    console.log(
      `balance before: ${ethers.formatUnits(balanceBefore, decimals)}`
    );

    await waitForTx(await pool.connect(user).withdraw(amount, user, user));

    const balanceAfter = await depositToken.balanceOf(user);
    console.log(`balance after: ${ethers.formatUnits(balanceAfter, decimals)}`);

    await run("review-agent-pool", { asset, label });
  });

task("agent-pool:borrow", "borrow asset from the pool")
  .addParam("asset", "asset address")
  .addParam("label", "name of the engine")
  .addParam("amount", "borrow amount")
  .setAction(async ({ asset, label, amount }, hre) => {
    const [, , borrower] = await hre.ethers.getSigners();
    const pool = await getAgentPool(asset, label);

    const depositToken = await hre.ethers.getContractAt("ERC20", asset);
    const decimals = await depositToken.decimals();

    amount = hre.ethers.parseUnits(amount, decimals);
    await waitForTx(await pool.connect(borrower).borrow(amount, borrower));

    const debits = await pool.debits(borrower);

    console.log(`borrowed: ${hre.ethers.formatUnits(debits, decimals)}`);

    await hre.run("review-agent-pool", { asset, label });
  });

task("agent-pool:repay", "repay asset to the pool")
  .addParam("asset", "asset address")
  .addParam("label", "name of the engine")
  .addParam("amount", "repay amount")
  .setAction(async ({ asset, label, amount }, hre) => {
    const [, , borrower] = await hre.ethers.getSigners();
    const pool = await getAgentPool(asset, label);

    const depositToken = await hre.ethers.getContractAt("ERC20", asset);
    const decimals = await depositToken.decimals();

    amount = hre.ethers.parseUnits(amount, decimals);
    await waitForTx(await depositToken.connect(borrower).approve(pool, amount));
    await waitForTx(await pool.connect(borrower).repay(amount, borrower, true));

    const debits = await pool.debits(borrower);

    console.log(`borrowed: ${hre.ethers.formatUnits(debits, decimals)}`);

    await hre.run("review-agent-pool", { asset, label });
  });

task("agent-pool:partial-repay", "repay asset to the pool")
  .addParam("asset", "asset address")
  .addParam("label", "name of the engine")
  .addParam("amount", "repay amount")
  .setAction(async ({ asset, label, amount }, hre) => {
    const [, , borrower] = await hre.ethers.getSigners();
    const pool = await getAgentPool(asset, label);

    const depositToken = await hre.ethers.getContractAt("ERC20", asset);
    const decimals = await depositToken.decimals();

    amount = hre.ethers.parseUnits(amount, decimals);
    await waitForTx(await depositToken.connect(borrower).approve(pool, amount));
    await waitForTx(
      await pool.connect(borrower).repay(amount, borrower, false)
    );

    const debits = await pool.debits(borrower);

    console.log(`borrowed: ${hre.ethers.formatUnits(debits, decimals)}`);

    await hre.run("review-agent-pool", { asset, label });
  });

task("agent-pool:settle-repay", "settle repay")
  .addParam("asset", "asset address")
  .addParam("label", "name of the engine")
  .setAction(async ({ asset, label }, hre) => {
    const [, , borrower] = await hre.ethers.getSigners();
    const pool = await getAgentPool(asset, label);

    const depositToken = await hre.ethers.getContractAt("ERC20", asset);
    const decimals = await depositToken.decimals();

    await waitForTx(await pool.connect(borrower).settleRepay(borrower));

    const debits = await pool.debits(borrower);

    console.log(`borrowed: ${hre.ethers.formatUnits(debits, decimals)}`);

    await hre.run("review-agent-pool", { asset, label });
  });
