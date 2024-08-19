import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "hardhat-dependency-compiler";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-verify";

dotenv.config();

import "./tasks";

const AVALANCHE_MAINNET_URL = process.env.AVALANCHE_MAINNET_URL || "";
const AVALANCHE_FUJI_URL = process.env.AVALANCHE_FUJI_URL || "";

const BASE_SEPOLIA_URL = process.env.BASE_SEPOLIA_URL || "";
const BASE_URL = process.env.BASE_URL || "";

const PK_USER = process.env.PK_USER || "";
const PK_OWNER = process.env.PK_OWNER || "";
const PK_BORROWER = process.env.PK_BORROWER || "";

const SNOWTRACE_API_KEY = process.env.SNOWTRACE_API_KEY || "";
const BASE_API_KEY = process.env.BASE_API_KEY || "";
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10_000, // use size-contracts to determine best value
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: 0,
    locksSetter: 1,
    user: 2,
    borrower: 3,
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    local: {
      url: "http://localhost:8545",
    },
    mainnet: {
      chainId: 43114,
      gasPrice: 25000000000,
      url: AVALANCHE_MAINNET_URL,
      accounts: [PK_OWNER, PK_USER, PK_BORROWER],
      live: true,
    },
    fuji: {
      chainId: 43113,
      gasPrice: 25000000000,
      url: AVALANCHE_FUJI_URL,
      accounts: [PK_OWNER, PK_USER, PK_BORROWER],
      live: false,
    },
    "base-sepolia": {
      chainId: 84532,
      gasPrice: 25000000000,
      url: BASE_SEPOLIA_URL,
      accounts: [PK_OWNER, PK_USER, PK_BORROWER],
      live: false,
    },
    base: {
      chainId: 8453,
      gasPrice: 25000000000,
      url: BASE_URL,
      accounts: [PK_OWNER, PK_USER, PK_BORROWER],
      live: false,
    },
    m1: {
      url: "https://mevm.testnet.imola.movementlabs.xyz",
      accounts: [PK_OWNER],
      chainId: 30732,
    },
    hyperliquid: {
      url: "https://api.hyperliquid-testnet.xyz/evm",
      accounts: [PK_OWNER],
      chainId: 998,
    },
  },
  etherscan: {
    apiKey: {
      fuji: "fuji",
      mainnet: SNOWTRACE_API_KEY,
      baseSepolia: BASE_API_KEY,
    },
  },
  sourcify: {
    enabled: false,
  },
  // contractSizer: {
  //   alphaSort: false,
  //   disambiguatePaths: false,
  //   runOnCompile: true,
  //   strict: false,
  // },
  dependencyCompiler: {
    paths: [
      "@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol",
      "@openzeppelin/contracts/interfaces/IERC5267.sol",
    ],
    keep: true,
  },
};

export default config;
