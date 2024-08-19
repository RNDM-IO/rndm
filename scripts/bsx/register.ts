import { BsxInstance, ENV_NAME } from "@bsx-exchange/client";
import { ethers } from "hardhat";
import { IERC5267__factory } from "../../typechain-types";

const BSX_BASE_URL = process.env.BSX_BASE_URL || "";

// USDC = 0xc59C5ceB57edd3c6cA281f5292Db2c1De3E77425

async function register() {
  const exchange = IERC5267__factory.connect(
    "0x6d6F70C0778C57664E32bA6b65b637cBc0C41F09",
    ethers.provider
  );

  // borrower vault
  const contractAccount = "0x9b547868d38D2AaD269561B616EDD54Deb00C8D8";
  const [owner, signer] = await ethers.getSigners();

  const message = `Please sign in with your wallet to access bsx.exchange. You are signing in on ${new Date().toUTCString()}. This message is exclusively signed with bsx.exchange for security.`;
  const nonce = BigInt(new Date().getTime() * 1e6).toString(); // time in nano seconds

  const eip712Domain = await exchange.eip712Domain();
  const domain = {
    name: eip712Domain.name,
    version: eip712Domain.version,
    verifyingContract: eip712Domain.verifyingContract,
    chainId: eip712Domain.chainId,
  };

  const registerTypes = {
    Register: [
      {
        name: "key",
        type: "address",
      },
      {
        name: "message",
        type: "string",
      },
      {
        name: "nonce",
        type: "uint64",
      },
    ],
  };
  const registerTypedData = {
    key: signer.address,
    message,
    nonce,
  };
  const accountSignature = await owner.signTypedData(
    domain,
    registerTypes,
    registerTypedData
  );

  const signKeyTypes = {
    SignKey: [
      {
        name: "account",
        type: "address",
      },
    ],
  };
  const signKeyTypedData = {
    account: contractAccount,
  };
  const signerSignature = await signer.signTypedData(
    domain,
    signKeyTypes,
    signKeyTypedData
  );

  const body = {
    user_wallet: contractAccount,
    signer: signer.address,
    nonce: nonce,
    wallet_signature: accountSignature,
    signer_signature: signerSignature,
    message: message,
  };
  const res = await fetch(`${BSX_BASE_URL}/users/register`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (res.status !== 200) {
    console.log("res =>", res);
    throw new Error("Failed to register");
  }

  const { api_key, api_secret, expired_at } = await res.json();
  console.log(api_key, api_secret, expired_at);

  const bsxInstance = await BsxInstance.createWithApiKey(
    api_key,
    api_secret,
    process.env.USER_PK || "",
    ENV_NAME.TESTNET
  );
}

register().catch(console.error);
