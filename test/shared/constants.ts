import { parseEther } from "ethers";

export const TO_MINT = parseEther("2000");
export const ONE_DAY = 24n * 3600n;
export const ONE_WEEK = ONE_DAY * 7n;
export const ONE_YEAR_IN_SECS = 365n * ONE_DAY;
export const PERFORMANCE_FEE_IN_BIPS = 500n;
export const ONE_ETHER = parseEther("1");
export const TOTAL_BORROW_LIMIT = 5000n;
export const MAX_BIPS = BigInt(10000);
export const DEFAULT_MIN_REPAY_BIPS = 2500;

export const DEFAULT_TOTAL_DEPOSIT_LIMIT = parseEther("10000");
export const DEFAULT_PERSONAL_DEPOSIT_LIMIT = parseEther("2000");

export const lock1 = {
  period: 1,
  percentage: 500,
};
export const lock2 = {
  period: 60,
  percentage: 1400,
};
export const lock3 = {
  period: 120,
  percentage: MAX_BIPS,
};

export const DEFAULT_POOL_CONFIG = {
  lockPeriod: ONE_YEAR_IN_SECS,
  performanceFee: PERFORMANCE_FEE_IN_BIPS,
  borrowCap: TOTAL_BORROW_LIMIT,
  supplyCap: DEFAULT_TOTAL_DEPOSIT_LIMIT,
  supplyCapPerAddress: DEFAULT_PERSONAL_DEPOSIT_LIMIT,
};
