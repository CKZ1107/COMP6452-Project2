// scripts/violation.js
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  const contractAddress = require("../deployed.json").ColdChainAlert;
  const abi = require("../artifacts/contracts/ColdChainAlert.sol/ColdChainAlert.json").abi;

  const contract = new ethers.Contract(contractAddress, abi, provider);

  const total = await alert.getTotalViolations();
  console.log(`Total violations: ${total}`);

  for (let i = 0; i < total; i++) {
    const [batchId, timestamp, temperature, reporter] = await alert.getViolation(i);
    const timeStr = new Date(Number(timestamp) * 1000).toLocaleString();  // ✅ 显式转换
    console.log(
      `🚨 Violation #${i + 1}:\n  Batch: ${batchId}\n  Temp: ${temperature}°C\n  Time: ${timeStr}\n  Reporter: ${reporter}\n`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
