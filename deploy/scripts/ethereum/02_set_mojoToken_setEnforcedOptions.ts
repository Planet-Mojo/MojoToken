import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MojoToken, MojoToken__factory } from "../../../typechain-types";
import { ethers } from "hardhat";
import { LZ_ETHEREUM_MOJO_TOKEN_ADDRESS, LZ_POLYGON_ENDPOINT_ID } from "../../mainnet-constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const useProxy = !hre.network.live;

  const signer = await ethers.getSigner(deployer);

  const token: MojoToken = MojoToken__factory.connect(
    LZ_ETHEREUM_MOJO_TOKEN_ADDRESS,
    signer
  );

  const tx = await token.setEnforcedOptions([
    {
      eid: LZ_POLYGON_ENDPOINT_ID,
      msgType: 1,
      // https://docs.layerzero.network/contracts/oft#message-execution-options
      options: "0x00030100110100000000000000000000000000030d40"
    },
  ]);
  await tx.wait(1);

  return !useProxy;
};
export default func;
func.id = "set_mojoToken_setEnforcedOptions";
func.tags = ["all"];
