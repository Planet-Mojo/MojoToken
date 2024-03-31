import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MojoToken, MojoToken__factory } from "../../../typechain-types";
import { ethers } from "hardhat";
import { LZ_ETHEREUM_ENDPOINT_ID, LZ_POLYGON_MOJO_TOKEN_ADDRESS } from "../../mainnet-constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const useProxy = !hre.network.live;

  const signer = await ethers.getSigner(deployer);

  const token: MojoToken = MojoToken__factory.connect(
    LZ_POLYGON_MOJO_TOKEN_ADDRESS,
    signer
  );

  const receiver = ethers.utils.hexZeroPad(deployer, 32);

  const sendParam = {
    to: receiver,
    amountLD: ethers.utils.parseEther("1000000000"),
    minAmountLD: ethers.utils.parseEther("1000000000"),
    dstEid: LZ_ETHEREUM_ENDPOINT_ID,
    extraOptions: "0x",
    composeMsg: "0x",
    oftCmd: "0x",
  };

  const fee = await token.quoteSend(sendParam, false);
  console.log("BRIDGE QUOTE", fee);
  console.log("BRIDGE QUOTE - fee", fee.nativeFee.toString());

  const tx = await token.send(sendParam, { nativeFee: fee.nativeFee.toString(), lzTokenFee: "0" }, deployer, {
    value: fee.nativeFee.toString()
  });
  await tx.wait(1);

  return !useProxy;
};
export default func;
func.id = "set_mojoToken_bridge";
func.tags = ["all"];
