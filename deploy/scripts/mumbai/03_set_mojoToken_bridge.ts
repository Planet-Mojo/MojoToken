import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MojoToken, MojoToken__factory } from "../../../typechain-types";
import { ethers } from "hardhat";

const LZ_MUMBAI_MOJ_TOKEN_ADDRESS = "0xE784d5AB201302D5e58b1616DD5c8410465Fee81";
const LZ_SEPOLIA_MOJ_TOKEN_ADDRESS = "0xD1A071E149bD4d1De36C1A006EB1D5D81E7ce23d";
const LZ_SEPOLIA_ENDPOINT_ID = 40161;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const useProxy = !hre.network.live;

  const signer = await ethers.getSigner(deployer);

  const token: MojoToken = MojoToken__factory.connect(
    LZ_MUMBAI_MOJ_TOKEN_ADDRESS,
    signer
  );

  const receiver = ethers.utils.hexZeroPad(deployer, 32);

  const sendParam = {
    to: receiver,
    amountLD: ethers.utils.parseEther("1"),
    minAmountLD: ethers.utils.parseEther("1"),
    dstEid: LZ_SEPOLIA_ENDPOINT_ID,
    extraOptions: "0x",
    composeMsg: "0x",
    oftCmd: "0x",
  };

  const fee = await token.quoteSend(sendParam, false);

  console.log("BRIDGE QUOTE", fee);

  const tx = await token.send(sendParam, fee, deployer);
  await tx.wait(1);

  return !useProxy;
};
export default func;
func.id = "set_mojoToken_bridge";
func.tags = ["all"];
