import { task } from "hardhat/config";

task("transfer:token", "Transfer erc20 tokens")
  .addParam("token", "deposit token address")
  .addParam("amount", "deposit amount")
  .addParam("to", "address to send")
  .setAction(async ({ token: tokenAddress, amount, to }, { ethers }) => {
    const [owner] = await ethers.getSigners();

    const depositToken = await ethers.getContractAt("ERC20", tokenAddress);
    const decimals = await depositToken.decimals();

    const balanceBefore = await depositToken.balanceOf(to);
    console.log(
      `balance before: ${ethers.formatUnits(balanceBefore, decimals)}`
    );

    await depositToken
      .connect(owner)
      .transfer(to, ethers.parseUnits(amount, decimals));

    const balanceAfter = await depositToken.balanceOf(to);
    console.log(`balance after: ${ethers.formatUnits(balanceAfter, decimals)}`);
  });
