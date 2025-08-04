const { ethers } = require("ethers");
const abi = require("../artifacts/contracts/ColdChainAlert.sol/ColdChainAlert.json").abi;
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const contractAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const contract = new ethers.Contract(contractAddr, abi, provider);

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "all") {
    const total = await contract.getTotalViolations();
    if (total == 0) {
      console.log("No temperature violations recorded!");
    } else {
      for (let i = 0; i < total; ++i) {
        const [batchId, timestamp, temperature, reporter] = await contract.getViolation(i);
        console.log(`Violation #${i + 1}:`);
        console.log(`  Batch: ${batchId}`);
        console.log(`  Time: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
        console.log(`  Temperature: ${temperature}℃`);
        console.log(`  Reporter: ${reporter}`);
        console.log("");
      }
    }
  } else if (args[0] === "one") {
    const index = parseInt(args[1]);
    if (isNaN(index)) {
      console.log("Usage: node scripts/lookup_coldchain.js one <index>");
      return;
    }
    try {
      const [batchId, timestamp, temperature, reporter] = await contract.getViolation(index);
      console.log(`Violation #${index}:`);
      console.log(`  Batch: ${batchId}`);
      console.log(`  Time: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
      console.log(`  Temperature: ${temperature}℃`);
      console.log(`  Reporter: ${reporter}`);
    } catch (e) {
      console.error("Query failed:", e.reason || e.message);
    }
  } else if (args[0] === "count") {
    const total = await contract.getTotalViolations();
    console.log(`Total violations: ${total}`);
  } else if (args[0] === "config") {
    const batchId = args[1];
    const roleManagerAddr = await contract.roleManager();
    const roleManagerAbi = require("../artifacts/contracts/roleManager.sol/RoleManager.json").abi;
    const roleManager = new ethers.Contract(roleManagerAddr, roleManagerAbi, provider);
    const [min, max] = await roleManager.getBatchTempRange(batchId);
    console.log(`  Min Temp: ${min}°C`);
    console.log(`  Max Temp: ${max}°C`);
    console.log("RoleManager address:", roleManager.target);
  } else {
    console.log("Usage:");
    console.log("  node scripts/coldChainAlert_lookup.js all                   # List all violations");
    console.log("  node scripts/coldChainAlert_lookup.js one <index>           # Query a violation by index");
    console.log("  node scripts/coldChainAlert_lookup.js count                 # Show total number of violations");
    console.log("  node scripts/coldChainAlert_lookup.js config <batchID>      # Show contract configuration");
  }
}
main();
