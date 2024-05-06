import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MojoToken, MojoToken__factory } from "../../../typechain-types";
import { ethers } from "hardhat";
import { LZ_ETHEREUM_MOJO_TOKEN_ADDRESS, LZ_POLYGON_ENDPOINT_ID, LZ_POLYGON_MOJO_TOKEN_ADDRESS } from "../../mainnet-constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const useProxy = !hre.network.live;

  const signer = await ethers.getSigner(deployer);

  const token: MojoToken = MojoToken__factory.connect(
    LZ_ETHEREUM_MOJO_TOKEN_ADDRESS,
    signer
  );

  // peer is the address of the MojoToken contract on the other network in bytes32 format
  const peer = ethers.utils.hexZeroPad(LZ_POLYGON_MOJO_TOKEN_ADDRESS, 32);
  
  const tx = await token.setPeer(LZ_POLYGON_ENDPOINT_ID, peer);
  await tx.wait(1);

  return !useProxy;
};
export default func;
func.id = "set_mojoToken_setPeer";
func.tags = ["all"];
