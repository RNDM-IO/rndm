import { ContractTransactionResponse } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

declare var hre: HardhatRuntimeEnvironment;

export const waitForTx = async (tx: ContractTransactionResponse) =>
  await tx.wait(1);
