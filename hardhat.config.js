require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { OWNER_PK, FARMER_PK, INSPECTOR_PK, PRIVATE_KEY_1 } = process.env;
const ACCS = [OWNER_PK, FARMER_PK, INSPECTOR_PK, PRIVATE_KEY_1]
  .filter(pk => typeof pk === "string" && /^0x[0-9a-fA-F]{64}$/.test(pk.trim()));

module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: process.env.RPC_URL || "http://127.0.0.1:8545",
      ...(ACCS.length ? { accounts: ACCS } : {}),
    },
  },
};


