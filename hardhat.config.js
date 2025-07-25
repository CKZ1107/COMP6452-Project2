require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers")
require("dotenv").config(); // 加载 .env 中的 RPC_URL 和私钥（如果你用 ethers）
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545"
    }
  }
};
