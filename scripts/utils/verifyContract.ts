import { HardhatRuntimeEnvironment } from "hardhat/types";

export const verifyContract = async (
  hre: HardhatRuntimeEnvironment,
  contractAddress: string,
  constructorArguments: any[],
  libraries?: any,
  contract?: string
): Promise<void> => {
  try {
    await hre.run("verify:verify", {
      contract: contract,
      address: contractAddress,
      constructorArguments: constructorArguments,
      libraries: libraries,
    });
  } catch (ex) {
    console.error(ex);
  }
};
