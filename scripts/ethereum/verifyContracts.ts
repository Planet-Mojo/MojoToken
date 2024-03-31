import { run } from "hardhat";
import { verifyMojoToken } from "./verifyMojoToken";

const deployer = "0x135538D9EBC23CC99D08842C7ae982e8c938b883";

const mojoToken = {
  address: "0xeD2d13A70acbD61074fC56bd0d0845e35f793e5E",
  deployer,
};

async function main() {
  await run("compile");

  await verifyMojoToken(
    mojoToken.deployer,
    mojoToken.address,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
