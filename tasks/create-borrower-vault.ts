import { task } from "hardhat/config";

task("create-borrower-vault", "Create a borrower vault")
  .addParam("pool", "pool address")
  .addParam("exchange", "exchange address")
  .setAction(async ({ pool, exchange }, hre) => {
    const { deployer } = await hre.getNamedAccounts();

    const Vault_ID = "Borrower Vault";
    await hre.deployments.deploy(Vault_ID, {
      contract: "BorrowerVault",
      from: deployer,
      args: [pool, exchange],
    });

    const { address: contractAddress } = await hre.deployments.get(Vault_ID);

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [pool, exchange],
    });
  });
