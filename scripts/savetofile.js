// scripts/savetofile.js
require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  // 1. 连接 Ganache 网络
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  // 2. 加载合约地址和 ABI
  const contractAddress = require("../deployed.json").ColdChainAlert;
  const abi = require("../artifacts/contracts/ColdChainAlert.sol/ColdChainAlert.json").abi;

  const alert = new ethers.Contract(contractAddress, abi, provider);

  // 3. 监听事件
  alert.on("TemperatureViolation", (batchId, timestamp, temp, reporter) => {
    console.log("🔥 TemperatureViolation event received!");

    const record = {
      batchId,
      timestamp: Number(timestamp),
      temperature: Number(temp),
      reporter,
    };

    const filePath = "data/violations.json";
    let existing = [];

    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        if (content.trim()) {
          existing = JSON.parse(content);
        }
      }
    } catch (err) {
      console.error("⚠️ Failed to read existing file:", err.message);
    }

    existing.push(record);

    try {
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
      console.log(`✅ Violation saved to ${filePath}`);
    } catch (err) {
      console.error("❌ Failed to write file:", err.message);
    }
  });

  console.log("👂 Listening for TemperatureViolation events...");
}

main().catch((err) => {
  console.error("❌ Error:", err);
});
