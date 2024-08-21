import { task } from "hardhat/config";

task("create-token", "Create a mock token")
  .addParam("name", "name of the token")
  .addParam("symbol", "symbol of the token")
  .addParam("decimals", "decimals of the token")
  .addParam("initialSupply", "initial supply of the token")
  .setAction(async ({ name, symbol, decimals, initialSupply }, hre) => {
    const [deployer] = await hre.ethers.getSigners();
    const token = await hre.ethers.deployContract(
      "MockERC20",
      [name, symbol, decimals],
      deployer
    );

    await token.waitForDeployment();
    console.log("Token deployed at:", token.target);
    await hre.run("verify:verify", {
      address: token.target,
      constructorArguments: [name, symbol, decimals],
    });

    // mint initial supply
    await token.mint(deployer, hre.ethers.parseUnits(initialSupply, decimals));
  });
