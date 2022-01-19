require('babel-polyfill');
require('babel-register');
require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider-privkey');

const privateKeys = process.env.PRIVATE_KEYS || ""
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    kovan: {
      provider: () => new HDWalletProvider(
        privateKeys.split(','), // array of private keys
        `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}` // url to an Ethereum Node
      ),
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 42
    }
  },

  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.10",    // Fetch exact version from solc-bin (default: truffle's version)
      optimizer: {
        enabled: true,
        runs: 200
      },
    }
  }
};
