import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseEther } from "ethers";
import { Errors } from "./shared/errors";
import { ONE_YEAR_IN_SECS } from "./shared/constants";
import { deployments } from "hardhat";
import { deployPoolAndDepositFixture } from "./shared/setupTests";

const amount = parseEther("1000");

const lockPeriod = ONE_YEAR_IN_SECS;

describe("AgentPool: Withdrawals", () => {
  const setupTests = deployments.createFixture(deployPoolAndDepositFixture);
  describe("#withdraw", () => {
    it("Should allow withdrawals after lock period", async () => {
      const { pool, asset, user } = await setupTests();

      await time.increase(lockPeriod);

      await expect(
        pool.connect(user).withdraw(parseEther("1000"), user, user)
      ).to.changeTokenBalance(asset, user, amount);
    });

    it("Shouldn't allow withdrawals before lock period", async () => {
      const { pool, user } = await setupTests();

      await expect(
        pool.connect(user).withdraw(parseEther("1000"), user, user)
      ).to.be.revertedWithCustomError(pool, Errors.FUNDS_LOCKED);
    });

    it("Shouldn't allow withdrawals for incorrect amount", async () => {
      const { pool, asset, user } = await setupTests();

      await time.increase(lockPeriod);

      await expect(
        pool.connect(user).withdraw(0, user, user)
      ).to.be.revertedWithCustomError(pool, Errors.INVALID_AMOUNT);
    });

    it("pending after lock period", async () => {
      const { pool, user, borrower } = await setupTests();

      const amountToBorrow = amount / 2n;

      await pool.connect(borrower).borrow(amountToBorrow, borrower);

      await time.increase(lockPeriod);

      expect(await pool.connect(user).withdraw(amount, user, user))
        .to.emit(pool, "WithdrawRequested")
        .withArgs(user, amount);
    });
  });
});
