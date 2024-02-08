import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const LZ_SEPOLIA_ENDPOINT_ADDRESS = "0x6edce65403992e310a62460808c4b910d972f10f";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const useProxy = !hre.network.live;

  await deploy("MojoToken", {
    contract: "MojoToken",
    from: deployer,
    args: [
      deployer,
      "My Test OFT",
      "MYOFT", 
      LZ_SEPOLIA_ENDPOINT_ADDRESS,
      true
    ],
    log: true,
  });

  return !useProxy;
};
export default func;
func.id = "deploy_mojoToken";
func.tags = ["all"];
