import { task } from "hardhat/config";

task("create-token", "Create a mock token")
  .addParam("name", "name of the token")
  .addParam("symbol", "symbol of the token")
  .addParam("initialSupply", "initial supply of the token")
  .setAction(async ({ name, symbol, initialSupply }, hre) => {
    const [deployer] = await hre.ethers.getSigners();

    const token = await hre.ethers.deployContract(
      "MockERC20",
      [name, symbol],
      deployer
    );

    await token.waitForDeployment();
    console.log("Token deployed at:", token.target);

    // mint initial supply
    await token.mint(deployer, hre.ethers.parseUnits(initialSupply, 18));
  });
