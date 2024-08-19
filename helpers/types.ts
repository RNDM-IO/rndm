export interface SymbolMap<T> {
  [symbol: string]: T;
}
export enum eTenderly {
  fork = "tenderly-fork",
}

export type eNetwork =
  | eEthereumNetwork
  | eAvalancheNetwork
  | eArbitrumNetwork
  | eOptimismNetwork
  | eTenderlyNetwork;

type eTenderlyNetwork = "tenderly";

export enum eOptimismNetwork {
  main = "optimism",
  testnet = "optimism-testnet",
}

export enum eEthereumNetwork {
  buidlerevm = "buidlerevm",
  kovan = "kovan",
  ropsten = "ropsten",
  main = "main",
  coverage = "coverage",
  hardhat = "hardhat",
  tenderly = "tenderly",
  rinkeby = "rinkeby",
  görli = "görli",
}

export enum eAvalancheNetwork {
  avalanche = "avalanche",
  fuji = "fuji",
}

export enum eArbitrumNetwork {
  arbitrum = "arbitrum",
  arbitrumTestnet = "arbitrum-testnet",
  görliNitro = "arbitrum-görli",
}

export enum EthereumNetworkNames {
  kovan = "kovan",
  ropsten = "ropsten",
  main = "main",
  avalanche = "avalanche",
  fuji = "fuji",
}

export type tEthereumAddress = string;
export type tStringTokenBigUnits = string; // 1 ETH, or 10e6 USDC or 10e18 DAI
export type tBigNumberTokenBigUnits = BigInt;
export type tStringTokenSmallUnits = string; // 1 wei, or 1 basic unit of USDC, or 1 basic unit of DAI
export type tBigNumberTokenSmallUnits = BigInt;
