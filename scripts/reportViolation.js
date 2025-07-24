// scripts/reportViolation.js
require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  // 1. 连接到本地 Ganache 私链
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  // 2. 用 inspector（监管者）私钥加载 signer
  const inspector = new ethers.Wallet(process.env.INSPECTOR_PK, provider);

  // 3. 获取合约 ABI + 地址
  const contractAddress = require("../deployed.json").ColdChainAlert;
  const abi = require("../artifacts/contracts/ColdChainAlert.sol/ColdChainAlert.json").abi;
  const contract = new ethers.Contract(contractAddress, abi, inspector);

  // 4. 上报温度
  const batchId = "BATCH001";
  const temperature = 12; // 超过阈值 8°C，会触发事件

  const tx = await contract.reportTemperature(batchId, temperature);
  await tx.wait();

  console.log(`✅ Temperature ${temperature}°C reported for batch ${batchId} by INSPECTOR`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
