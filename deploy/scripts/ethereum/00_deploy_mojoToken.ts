import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { LZ_ETHEREUM_ENDPOINT_ADDRESS } from "../../mainnet-constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const useProxy = !hre.network.live;

  await deploy("MojoToken", {
    contract: "MojoToken",
    from: deployer,
    args: [
      deployer,
      "Planet Mojo",
      "MOJO", 
      LZ_ETHEREUM_ENDPOINT_ADDRESS,
      false
    ],
    log: true,
  });

  return !useProxy;
};
export default func;
func.id = "deploy_mojoToken";
func.tags = ["all"];
