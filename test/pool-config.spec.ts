import { expect } from "chai";
import { deployments } from "hardhat";
import {
  DEFAULT_PERSONAL_DEPOSIT_LIMIT,
  DEFAULT_TOTAL_DEPOSIT_LIMIT,
  MAX_BIPS,
} from "./shared/constants";
import { Errors } from "./shared/errors";
import { deployPoolFixture } from "./shared/setupTests";

describe("pool Configuration", () => {
  const setupTests = deployments.createFixture(deployPoolFixture);

  describe("#setSupplyCap", () => {
    it("Should allow deposit limits updating", async () => {
      const { pool } = await setupTests();
      await expect(pool.setSupplyCap(DEFAULT_TOTAL_DEPOSIT_LIMIT + 1000n)).to
        .eventually.be.fulfilled;
      await expect(pool.setSupplyCap("0")).to.eventually.be.fulfilled;
      const config = await pool.config();
      expect(config.supplyCap).to.be.equal(0);
    });
    it("fails if msg sender is not a admin", async () => {
      const { pool, user } = await setupTests();
      await expect(
        pool.connect(user).setSupplyCap(DEFAULT_TOTAL_DEPOSIT_LIMIT + 1000n)
      ).to.be.revertedWithCustomError(pool, "AccessControlUnauthorizedAccount");
    });
  });

  describe("#setSupplyCapPerAddress", () => {
    it("Should allow deposit limits updating", async () => {
      const { pool } = await setupTests();
      await expect(
        pool.setSupplyCapPerAddress(DEFAULT_PERSONAL_DEPOSIT_LIMIT + 1000n)
      ).to.eventually.be.fulfilled;
      await expect(
        pool.setSupplyCapPerAddress("0")
      ).to.be.revertedWithCustomError(
        pool,
        Errors.INVALID_SUPPLY_CAP_PER_ADDRESS
      );

      const config = await pool.config();
      expect(config.supplyCapPerAddress).to.be.equal(
        DEFAULT_PERSONAL_DEPOSIT_LIMIT + 1000n
      );
    });
    it("fails if msg sender is not a admin", async () => {
      const { pool, user } = await setupTests();
      await expect(
        pool
          .connect(user)
          .setSupplyCapPerAddress(DEFAULT_PERSONAL_DEPOSIT_LIMIT + 1000n)
      ).to.be.revertedWithCustomError(pool, "AccessControlUnauthorizedAccount");
    });
  });

  describe("#setBorrowCap", () => {
    const newBorrowCap = 6000;
    it("updates borrow cap", async () => {
      const { pool } = await setupTests();

      await pool.setBorrowCap(newBorrowCap);
      expect((await pool.config()).borrowCap).to.be.equal(newBorrowCap);
    });
    it("Shouldn't allow updating borrow limit with incorrect value", async () => {
      const { pool } = await setupTests();

      await expect(
        pool.setBorrowCap(MAX_BIPS + 1n)
      ).to.be.revertedWithCustomError(pool, Errors.INVALID_BASIS_POINT);
    });
    it("fails if msg sender is not a admin", async () => {
      const { pool, user } = await setupTests();
      await expect(
        pool.connect(user).setBorrowCap(newBorrowCap)
      ).to.be.revertedWithCustomError(pool, "AccessControlUnauthorizedAccount");
    });
  });

  describe("#setPerformanceFee", () => {
    const performanceFee = 1100;
    it("set performance fee", async () => {
      const { pool } = await setupTests();

      await pool.setPerformanceFee(performanceFee);
      expect((await pool.config()).performanceFee).to.be.equal(performanceFee);
    });

    it("fails if msg.sender is not the default admin", async () => {
      const { pool, user } = await setupTests();
      await expect(
        pool.connect(user).setPerformanceFee(performanceFee)
      ).to.be.revertedWithCustomError(pool, "AccessControlUnauthorizedAccount");
    });
  });

  describe("#setLockPeriod", () => {
    it("set lock period", async () => {
      const { pool } = await setupTests();

      const { lockPeriod } = await pool.config();

      await expect(pool.setLockPeriod(lockPeriod + 1n))
        .to.emit(pool, "LockPeriodUpdated")
        .withArgs(lockPeriod, lockPeriod + 1n);
      expect((await pool.config()).lockPeriod).to.be.equal(lockPeriod + 1n);
    });

    it("fails if msg.sender is not the default admin", async () => {
      const { pool, user } = await setupTests();
      await expect(
        pool.connect(user).setLockPeriod(100)
      ).to.be.revertedWithCustomError(pool, "AccessControlUnauthorizedAccount");
    });
  });

  describe("#setMinRepayBips", () => {
    it("set min repay bips", async () => {
      const { pool } = await setupTests();

      const minRepayBips = await pool.minRepayBips();

      await expect(pool.setMinRepayBips(minRepayBips + 1n))
        .to.emit(pool, "MinRepayBipsUpdated")
        .withArgs(minRepayBips + 1n);
      expect(await pool.minRepayBips()).to.be.equal(minRepayBips + 1n);
    });

    it("fails if msg.sender is not the default admin", async () => {
      const { pool, user } = await setupTests();
      await expect(
        pool.connect(user).setMinRepayBips(5000)
      ).to.be.revertedWithCustomError(pool, "AccessControlUnauthorizedAccount");
    });

    it("fails if new value is zero or bigger than max bips", async () => {
      const { pool, deployer } = await setupTests();
      await expect(
        pool.connect(deployer).setMinRepayBips(0)
      ).to.be.revertedWithCustomError(pool, Errors.INVALID_AMOUNT);
      await expect(
        pool.connect(deployer).setMinRepayBips(MAX_BIPS + 1n)
      ).to.be.revertedWithCustomError(pool, Errors.INVALID_AMOUNT);
    });
  });
});
