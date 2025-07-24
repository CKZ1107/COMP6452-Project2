// scripts/violation.js
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x79F322C91B3AD907F60529Deca0DcbabCeffF72C"; // 替换为你的合约地址
  const alert = await hre.ethers.getContractAt("ColdChainAlert", contractAddress);

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
