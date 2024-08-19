import { expect } from "chai";
import { parseEther } from "ethers";
import { deployments, ethers } from "hardhat";
import { Errors } from "./shared/errors";
import { amount, deployPoolFixture } from "./shared/setupTests";

describe("AgentPool: Deposits", () => {
  const setupTests = deployments.createFixture(deployPoolFixture);
  it("Should allow deposits", async () => {
    const { pool, asset, user } = await setupTests();
    const amount = parseEther("1000");

    await asset.connect(user).approve(pool, amount);
    await expect(pool.connect(user).deposit(amount, user)).to.be.fulfilled;
    expect(await pool.totalAssets()).to.equal(amount);
    expect(await pool.totalBorrowed()).to.equal(0);
  });

  it("revert if zero deposit", async () => {
    const { pool, user } = await setupTests();

    await expect(
      pool.connect(user).deposit(0, user)
    ).to.be.revertedWithCustomError(pool, Errors.INVALID_AMOUNT);
  });

  it("revert if personal deposit limit exceeds", async () => {
    const { pool, user } = await setupTests();

    const supplyCapPerAddress = ethers.parseEther("1");
    await pool.setSupplyCapPerAddress(supplyCapPerAddress);

    await expect(
      pool.connect(user).deposit(amount, user)
    ).to.be.revertedWithCustomError(pool, "ERC4626ExceededMaxDeposit");
  });

  it("revert if total deposit limit exceeds", async () => {
    const { pool, user } = await setupTests();

    await pool.setSupplyCap(amount / 2n);

    await expect(
      pool.connect(user).deposit(amount / 2n + 1n, user)
    ).to.be.revertedWithCustomError(pool, "ERC4626ExceededMaxDeposit");
  });

  describe("#maxDeposit", () => {
    it("should be zero if deposit amount exceeds supplyCap of the address", async () => {
      const { pool, user } = await setupTests();
      await pool.connect(user).deposit(amount, user);
      await pool.setSupplyCapPerAddress(amount / 2n);

      expect(await pool.maxDeposit(user)).to.eq(0);
    });

    it("should be zero if total deposit amount exceeds supplyCap", async () => {
      const { pool, user } = await setupTests();
      await pool.connect(user).deposit(amount, user);
      await pool.setSupplyCap(amount);

      expect(await pool.maxDeposit(user)).to.eq(0);
    });
  });

  describe("#maxMint", () => {
    it("should follow maxDeposit", async () => {
      const { pool, user } = await setupTests();
      await pool.connect(user).deposit(amount, user);

      const maxDeposit = await pool.maxDeposit(user);

      const maxMint = await pool.maxMint(user);

      expect(maxMint).to.be.eq(await pool.previewDeposit(maxDeposit));
    });

    it("should be zero if deposit amount exceeds supplyCap of the address", async () => {
      const { pool, user } = await setupTests();
      await pool.connect(user).deposit(amount, user);
      await pool.setSupplyCapPerAddress(amount / 2n);

      expect(await pool.maxMint(user)).to.eq(0);
    });

    it("should be zero if total deposit amount exceeds supplyCap", async () => {
      const { pool, user } = await setupTests();
      await pool.connect(user).deposit(amount, user);
      await pool.setSupplyCap(amount);

      expect(await pool.maxMint(user)).to.eq(0);
    });
  });
});
