const fs = require("fs");
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x79F322C91B3AD907F60529Deca0DcbabCeffF72C";
  const alert = await hre.ethers.getContractAt("ColdChainAlert", contractAddress);

  alert.on("TemperatureViolation", (batchId, timestamp, temp, reporter) => {
    console.log("🔥 Event received!");

    const record = {
      batchId,
      timestamp: Number(timestamp),
      temperature: Number(temp),
      reporter,
    };

    // ⛏ 安全读写文件
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
      console.log("✅ Violation saved to:", filePath);
    } catch (err) {
      console.error("❌ Failed to write file:", err.message);
    }
  });

  console.log("Listening for violations...");
}

main();
