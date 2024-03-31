import { verifyContract } from "../utils/verifyContract";
import hre from "hardhat";
import { isContractVerifiedOnEthereum } from "../utils/isContractVerifiedOnEthereum";

export const LZ_ETHEREUM_ENDPOINT_ADDRESS = "0x1a44076050125825900e736c501f859c50fe728c";

export const verifyMojoToken = async (
  deployer: string,
  contractAddress: string,
) => {
  if (await isContractVerifiedOnEthereum(contractAddress)) {
    console.log("MojoToken already verified");
    return;
  }

  await verifyContract(
    hre,
    contractAddress,
    [
      deployer,
      "Planet Mojo",
      "MOJO",
      LZ_ETHEREUM_ENDPOINT_ADDRESS,
      false
    ],
    undefined,
    "contracts/token/erc20/MojoToken.sol:MojoToken"
  );
};
