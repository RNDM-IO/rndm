import { ethers } from "hardhat";
import { IERC5267__factory } from "../../typechain-types";

const BSX_BASE_URL = process.env.BSX_BASE_URL || "";

async function withdraw() {
  const exchange = IERC5267__factory.connect(
    "0x6d6F70C0778C57664E32bA6b65b637cBc0C41F09",
    ethers.provider
  );

  const contractAccount = "0x9b547868d38D2AaD269561B616EDD54Deb00C8D8";
  const usdcAddress = "0xc59C5ceB57edd3c6cA281f5292Db2c1De3E77425";
  const [owner] = await ethers.getSigners();

  const amount = "456"; // 456 USDC
  const nonce = BigInt(new Date().getTime() * 1e6).toString(); // time in nano seconds

  const eip712Domain = await exchange.eip712Domain();
  const domain = {
    name: eip712Domain.name,
    version: eip712Domain.version,
    verifyingContract: eip712Domain.verifyingContract,
    chainId: eip712Domain.chainId,
  };
  const withdrawTypes = {
    Withdraw: [
      { name: "sender", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint128" },
      { name: "nonce", type: "uint64" },
    ],
  };
  const withdrawTypedData = {
    sender: contractAccount,
    token: usdcAddress,
    amount: ethers.parseEther(amount),
    nonce,
  };
  const withdrawSignature = await owner.signTypedData(
    domain,
    withdrawTypes,
    withdrawTypedData
  );
  const body = {
    sender: withdrawTypedData.sender,
    amount,
    token: usdcAddress,
    nonce,
    signature: withdrawSignature,
  };
  const res = await fetch(`${BSX_BASE_URL}/transfers/withdraw`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (res.status !== 200) {
    throw new Error("Failed to withdraw");
  }
}

withdraw().catch(console.error);
