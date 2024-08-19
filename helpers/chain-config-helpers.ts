import { HardhatRuntimeEnvironment } from "hardhat/types";

declare var hre: HardhatRuntimeEnvironment;
export const isProduction = () => {
  const network = process.env.FORK || hre.network.name;
  return hre.config.networks[network]?.live || false;
};
