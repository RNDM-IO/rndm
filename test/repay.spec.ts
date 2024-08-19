import { expect } from "chai";
import { MaxUint256 } from "ethers";
import { deployments } from "hardhat";
import { MAX_BIPS } from "./shared/constants";
import { Errors } from "./shared/errors";
import { amount, deployPoolAndDepositFixture } from "./shared/setupTests";

describe("AgentPool: Repay", () => {
  const setupTests = deployments.createFixture(deployPoolAndDepositFixture);
  describe("settle", () => {
    it("Should allow borrow repayment", async () => {
      const { borrower, pool } = await setupTests();

      const borrowAmount = amount / 2n;

      await pool.connect(borrower).borrow(borrowAmount, borrower);

      await pool.connect(borrower).repay(borrowAmount, borrower, true);
    });

    it("Should allow max repayment", async () => {
      const { borrower, pool } = await setupTests();

      const borrowAmount = amount / 2n;

      await pool.connect(borrower).borrow(borrowAmount, borrower);

      await pool.connect(borrower).repay(MaxUint256, borrower, true);
    });

    it("Shouldn't allow repay invalid amount", async () => {
      const { pool, borrower } = await setupTests();

      await expect(pool.connect(borrower).borrow(amount / 2n, borrower)).to.be
        .fulfilled;

      await expect(
        pool.connect(borrower).repay(0, borrower, true)
      ).to.be.revertedWithCustomError(pool, Errors.INVALID_AMOUNT);
    });

    it("should not be able to repay invalid amount", async () => {
      const { pool, borrower } = await setupTests();

      // distribute reward
      await expect(
        pool.connect(borrower).repay(0, borrower, true)
      ).to.be.revertedWithCustomError(pool, Errors.INVALID_AMOUNT);
    });

    it("should not be able to repay if no borrow", async () => {
      const { borrower, pool } = await setupTests();

      await expect(
        pool.connect(borrower).repay(amount / 2n, borrower, true)
      ).to.be.revertedWithCustomError(pool, Errors.NOTHING_TO_REPAY);
    });
  });

  describe("partial repay", () => {
    it("partial repay only updates repaid amount", async () => {
      const { borrower, pool } = await setupTests();

      const borrowAmount = amount / 2n;

      await pool.connect(borrower).borrow(borrowAmount, borrower);

      await pool.connect(borrower).repay(borrowAmount / 2n, borrower, false);

      expect(await pool.debits(borrower)).to.equal(borrowAmount);
    });
  });

  describe("#settleRepay", () => {
    it("only admin or borrower can settle", async () => {
      const { deployer, borrower, user, pool } = await setupTests();

      // borrower
      {
        const borrowAmount = amount / 2n;

        await pool.connect(borrower).borrow(borrowAmount, borrower);

        await pool.connect(borrower).partialRepay(borrowAmount, borrower);

        await pool.connect(borrower).settleRepay(borrower);
      }

      // admin
      {
        const borrowAmount = amount / 2n;

        await pool.connect(borrower).borrow(borrowAmount, borrower);

        await pool.connect(borrower).partialRepay(borrowAmount, borrower);

        await pool.connect(deployer).settleRepay(borrower);
      }

      // other user fails
      {
        const borrowAmount = amount / 2n;

        await pool.connect(borrower).borrow(borrowAmount, borrower);

        await pool.connect(borrower).partialRepay(borrowAmount, borrower);

        await expect(
          pool.connect(user).settleRepay(borrower)
        ).to.be.revertedWithCustomError(pool, Errors.UNAUTHORIZED);
      }
    });

    it("should revert if repaid amount is less than minRepay amount", async () => {
      const { deployer, borrower, user, pool } = await setupTests();
      const borrowAmount = amount / 2n;

      const minRepayBips = await pool.minRepayBips();

      await pool.connect(borrower).borrow(borrowAmount, borrower);

      await pool
        .connect(borrower)
        .partialRepay((borrowAmount * minRepayBips) / MAX_BIPS - 1n, borrower);

      await expect(
        pool.connect(borrower).settleRepay(borrower)
      ).to.be.revertedWithCustomError(
        pool,
        Errors.INSUFFICIENT_AMOUNT_TO_SETTLE
      );
    });
  });
});
