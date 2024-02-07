// eslint-disable-next-line @typescript-eslint/no-var-requires
require("custom-env").env(process.env.ENV);

import { task, HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-waffle";
import "hardhat-contract-sizer";

task("accounts", "Prints the list of accounts", async (_, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100000,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
  },
  mocha: {
    timeout: 50000,
  },
  networks: {
    hardhat: {
      live: false,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      chainId: 1337,
      mining: {
        auto: false,
        interval: 500,
      },
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
      deploy: ["./deploy/scripts/localhost"],
    },
    localhost: {
      live: false,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
      deploy: ["./deploy/scripts"],
    },
    rinkeby: {
      live: true,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      chainId: 4,
      url: process.env.RINKEBY_URL,
      deploy: ["./deploy/scripts/rinkeby"],
      timeout: 300000,
    },
    polygon: {
      live: true,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      chainId: 137,
      url: process.env.POLYGON_URL,
      deploy: ["./deploy/scripts/polygon"],
      timeout: 300000,
    },
    testnet: {
      live: true,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      chainId: 137,
      url: process.env.POLYGON_URL,
      deploy: ["./deploy/scripts/testnet"],
      timeout: 300000,
    },
    mumbai: {
      live: true,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      chainId: 80001,
      url: process.env.MUMBAI_URL,
      deploy: ["./deploy/scripts/mumbai"],
      timeout: 300000,
    },
    sepolia: {
      live: true,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      chainId: 11155111,
      url: process.env.SEPOLIA_URL,
      deploy: ["./deploy/scripts/sepolia"],
      timeout: 300000,
    },
  },
  etherscan: {
    apiKey: {
      rinkeby: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
  },
};
export default config;
