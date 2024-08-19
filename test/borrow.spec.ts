import { expect } from "chai";
import { parseEther } from "ethers";
import { deployments } from "hardhat";
import { Errors } from "./shared/errors";
import { deployPoolAndDepositFixture } from "./shared/setupTests";

const amount = parseEther("1000");

describe("AgentPool: Borrow", () => {
  const setupTests = deployments.createFixture(deployPoolAndDepositFixture);
  it("Should allow borrowing", async () => {
    const { borrower, pool } = await setupTests();
    await pool.connect(borrower).borrow(amount / 2n, borrower);
  });

  it("fails if not a borrower", async () => {
    const { user, pool } = await setupTests();

    await expect(
      pool.connect(user).borrow(amount / 2n, user)
    ).to.be.revertedWithCustomError(pool, "AccessControlUnauthorizedAccount");
  });

  it("fails if borrow cap exceeds", async () => {
    const { pool, locksSetter: otherBorrower, borrower } = await setupTests();

    const borrowAmount = amount;

    await pool.connect(borrower).borrow(borrowAmount, borrower);

    const borrowerRole = await pool.BORROWER_ROLE();
    await pool.grantRole(borrowerRole, otherBorrower);

    await expect(
      pool.connect(otherBorrower).borrow(amount, otherBorrower)
    ).to.be.revertedWithCustomError(pool, Errors.BORROW_CAP_EXCEEDED);
  });

  it("fails if borrower has debit", async () => {
    const { borrower, pool } = await setupTests();

    await pool.connect(borrower).borrow(amount / 10n, borrower);
    await expect(
      pool.connect(borrower).borrow(amount / 10n, borrower)
    ).to.be.revertedWithCustomError(pool, Errors.MUST_REPAY_TO_BORROW_MORE);
  });
});
