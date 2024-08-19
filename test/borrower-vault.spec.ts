import { expect } from "chai";
import { parseEther } from "ethers";
import { deployments, ethers } from "hardhat";
import { deployPoolAndDepositFixture } from "./shared/setupTests";

const amount = parseEther("1000");

describe("BorrowerVault: ", () => {
  const setupTests = deployments.createFixture(deployPoolAndDepositFixture);
  it("Should allow borrowing", async () => {
    const { borrower, pool, asset, locksSetter: exchange } = await setupTests();
    const borrowerVault = await ethers.deployContract("BorrowerVault", [
      pool.target,
      exchange.address,
    ]);
    await borrowerVault.waitForDeployment();

    await borrowerVault.setOperator(borrower, true);
    const borrowerRole = await pool.BORROWER_ROLE();
    await pool.grantRole(borrowerRole, borrowerVault);
    const borrowAmount = amount / 2n;
    await expect(
      borrowerVault.connect(borrower).borrow(borrowAmount)
    ).to.changeTokenBalances(
      asset,
      [borrowerVault.target, pool.target],
      [borrowAmount, "-" + borrowAmount]
    );
  });

  it("Should allow repay", async () => {
    const { borrower, pool, locksSetter: exchange } = await setupTests();
    const borrowerVault = await ethers.deployContract("BorrowerVault", [
      pool.target,
      exchange.address,
    ]);

    await borrowerVault.setOperator(borrower, true);
    const borrowerRole = await pool.BORROWER_ROLE();
    await pool.grantRole(borrowerRole, borrowerVault);
    const borrowAmount = amount / 2n;
    await borrowerVault.connect(borrower).borrow(borrowAmount);

    await borrowerVault.connect(borrower).repay(borrowAmount, true);
  });
});
