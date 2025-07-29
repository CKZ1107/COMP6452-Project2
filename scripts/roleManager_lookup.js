const { ethers } = require("ethers");
const abi = require("../artifacts/contracts/roleManager.sol/RoleManager.json").abi;
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const contractAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contract = new ethers.Contract(contractAddr, abi, provider);

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "batch-events") {
    const batchId = args[1];
    const events = await contract.getEvents(batchId);
    if (events.length === 0) {
      console.log(`No events found for batch ${batchId}`);
    } else {
      events.forEach((e, i) => {
        console.log(`Event #${i + 1}:`);
        console.log(`  type: ${e.eventType}`);
        console.log(`  metadata: ${e.metadata}`);
        console.log(`  timestamp: ${new Date(Number(e.timestamp) * 1000).toLocaleString()}`);
        console.log(`  actorRole: ${e.actorRole} (0:NONE, 1:FARMER, 2:INSPECTOR, 3:TRANSPORTER)`);
        console.log(`  actor: ${e.actor}\n`);
      });
    }
  } else if (args[0] === "user-role") {
    const addr = args[1];
    const role = await contract.getRole(addr);
    const roles = ["NONE", "FARMER", "INSPECTOR", "TRANSPORTER"];
    console.log(`Role of ${addr}:`, roles[role] || role);
  } else if (args[0] === "batch-exists") {
    const batchId = args[1];
    const exists = await contract.batches(batchId);
    console.log(`Batch ${batchId} registered?`, exists);
  } else if (args[0] === "owner") {
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
  } else {
    console.log("Usage:");
    console.log("  node scripts/roleManager_lookup.js batch-events <BATCHID>");
    console.log("  node scripts/roleManager_lookup.js user-role <ADDRESS>");
    console.log("  node scripts/roleManager_lookup.js batch-exists <BATCHID>");
    console.log("  node scripts/roleManager_lookup.js owner");
  }
}

main();
