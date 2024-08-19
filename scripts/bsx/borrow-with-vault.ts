import hre from "hardhat";
import { getAgentPool } from "../../helpers/contract-getters";
import { waitForTx } from "../../helpers/utilities/tx";
import { BorrowerVault } from "../../typechain-types";
async function borrow() {
  const asset = "0xc59C5ceB57edd3c6cA281f5292Db2c1De3E77425";
  const [operator] = await hre.ethers.getSigners();
  const pool = await getAgentPool(asset, "test");
  const borrowerVault =
    await hre.ethers.getContract<BorrowerVault>("Borrower Vault");

  const depositToken = await hre.ethers.getContractAt("ERC20", asset);
  const decimals = await depositToken.decimals();

  const amount = hre.ethers.parseUnits("2000", decimals);
  await waitForTx(await borrowerVault.connect(operator).borrow(amount));

  const debits = await pool.debits(borrowerVault);

  console.log(`borrowed: ${hre.ethers.formatUnits(debits, decimals)}`);
}

borrow().catch(console.error);
