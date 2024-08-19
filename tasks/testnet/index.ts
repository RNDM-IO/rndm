import { task } from "hardhat/config";
import { waitForTx } from "../../helpers/utilities/tx";
import { time } from "@nomicfoundation/hardhat-network-helpers";

task("mint:mock", "mint mock token")
  .addParam("token", "token address")
  .addParam("amount", "amount to mint")
  .addParam("beneficiary", "beneficiary address")
  .setAction(async ({ token, amount, beneficiary }, { ethers }) => {
    const [deployer, user] = await ethers.getSigners();
    beneficiary = beneficiary || user;

    token = await ethers.getContractAt("MockERC20", token);
    const decimals = await token.decimals();

    amount = ethers.parseUnits(amount, decimals);
    console.log(`balance before: ${await token.balanceOf(beneficiary)}`);
    await waitForTx(await token.connect(deployer).mint(beneficiary, amount));
    console.log(`balance after: ${await token.balanceOf(beneficiary)}`);
  });

task("time-travel", "travel time for test")
  .addParam("seconds", "seconds to add")
  .setAction(async ({ seconds }, { ethers }) => {
    console.log(
      `current time: ${(await ethers.provider.getBlock("latest"))!.timestamp}`
    );
    console.log("Travel...");
    console.log(seconds);
    await time.increase(parseInt(seconds));
    console.log(
      `current time: ${(await ethers.provider.getBlock("latest"))!.timestamp}`
    );
  });

task("deploy:mock", "deploy mock token").setAction(async ({}, { ethers }) => {
  // const [deployer, user] = await ethers.getSigners();
  const mock = await ethers.deployContract("MockERC20", [
    "MockIncentive",
    "MCI",
  ]);
  await mock.waitForDeployment();
  console.log(`mock token is deployed: ${mock}`);
});
