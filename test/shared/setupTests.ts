import { parseEther, MaxUint256 } from "ethers";
import { ethers } from "hardhat";
import { DeploymentsExtension } from "hardhat-deploy/types";
import { WRAPPED_NATIVE_ID, TESTNET_ASSET_ID } from "../../helpers/deploy-ids";
import { NativeWrapperMock, MockERC20 } from "../../typechain-types";
import { PERFORMANCE_FEE_IN_BIPS, ONE_YEAR_IN_SECS } from "./constants";
import { deployAgentPool } from "./deploy-pool";

export const commonSetupFixture = async ({
  deployments,
}: {
  deployments: DeploymentsExtension;
}) => {
  await deployments.fixture(["init-testnet"]);
  const { deployer, locksSetter, user, borrower } =
    await ethers.getNamedSigners();
  const weth = await ethers.getContract<NativeWrapperMock>(WRAPPED_NATIVE_ID);
  const asset = await ethers.getContract<MockERC20>(TESTNET_ASSET_ID);

  return {
    weth,
    asset,
    deployer,
    locksSetter,
    user,
    borrower,
  };
};

export const deployPoolFixture = async ({
  deployments,
}: {
  deployments: DeploymentsExtension;
}) => {
  const { weth, asset, deployer, locksSetter, user, borrower } =
    await commonSetupFixture({ deployments });

  const label = "Test";
  const initPoolParams = {
    underlying: asset.target,
    name: label,
    tokenName: "VCRedTestMock",
    tokenSymbol: "vTestMock",
    admin: deployer.address,
    feeCollector: deployer.address,
    performanceFee: PERFORMANCE_FEE_IN_BIPS,
    lockPeriod: ONE_YEAR_IN_SECS,
  };
  const pool = await deployAgentPool(initPoolParams);

  for (const signer of [user, borrower]) {
    for (const token of [asset]) {
      await token.mint(signer.address, parseEther("10000"));
      await token.connect(signer).approve(pool.target, MaxUint256);
    }
    await weth["mint(address,uint256)"](signer.address, parseEther("10000"));
    await weth.connect(signer).approve(pool.target, MaxUint256);
  }

  const borrowerRole = await pool.BORROWER_ROLE();
  await pool.grantRole(borrowerRole, borrower.address);

  return {
    pool,
    weth,
    asset,
    deployer,
    locksSetter,
    user,
    borrower,
  };
};

export const amount = parseEther("1000");

export const deployPoolAndDepositFixture = async ({
  deployments,
}: {
  deployments: DeploymentsExtension;
}) => {
  const fixture = await deployPoolFixture({ deployments });

  const { pool, user, borrower, deployer } = fixture;

  await pool.connect(user).deposit(amount, user.address);
  await pool.connect(borrower).deposit(amount, borrower.address);

  return fixture;
};
