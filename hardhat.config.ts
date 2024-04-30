/** @type import('hardhat/config').HardhatUserConfig */

import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import 'hardhat-deploy'
import 'solidity-coverage'
// import 'hardhat-gas-reporter'
// import 'hardhat-contract-sizer'
import dotenv from 'dotenv'
import '@typechain/hardhat'

dotenv.config()



module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.7",
      },
      {
        version: "0.8.20",
        settings: {},
      },
    ],
  },
  namedAccounts : {
    deployer : {
      default : 0
    },
    buyer : {
      default : 1
    }
  }
};
