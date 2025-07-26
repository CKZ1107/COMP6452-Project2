const fs = require("fs");
const { ethers } = require("ethers");

async function main() {
  const wsProvider = new ethers.WebSocketProvider("ws://127.0.0.1:8545");

  const deployed = JSON.parse(fs.readFileSync("deployed.json"));
  const contractAddress = deployed.ColdChainAlert;

  const abi = require("../artifacts/contracts/ColdChainAlert.sol/ColdChainAlert.json").abi;
  const contract = new ethers.Contract(contractAddress, abi, wsProvider);  // ✅ fixed here

  contract.on("TemperatureViolation", (batchId, timestamp, temp, reporter) => {
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
      fs.mkdirSync("data", { recursive: true });
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
