// scripts/simulateWorkflow.js
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const signers = await hre.ethers.getSigners();
  const farmer = signers[1];
  const inspector = signers[2];
  console.log("Inspector address:", inspector.address);
  const deployed = JSON.parse(fs.readFileSync("deployed.json"));
  const roleManagerAddress = deployed.RoleManager;

  const RoleManager = await hre.ethers.getContractFactory("RoleManager");
  const roleManager = RoleManager.attach(roleManagerAddress);

  // Register actors
  await roleManager.registerActor(farmer.address, 1); // FARMER
  await roleManager.registerActor(inspector.address, 2); // INSPECTOR
  console.log("✅ Actors registered");

  // Register batch and events
  await roleManager.connect(farmer).registerBatch("BATCH001");
  console.log("📦 Batch registered");

  await roleManager.connect(farmer).recordEvent(farmer.address, "BATCH001", "Harvest", "Organic apples harvested");
  console.log("📝 Harvest event recorded");

  await roleManager.connect(inspector).recordEvent(inspector.address, "BATCH001", "Inspection", "Inspected and certified");
  console.log("📝 Inspection event recorded");

  //const events = await roleManager.getEvents("BATCH001");
  //console.log("📜 Batch Events:");
  //for (let e of events) {
    //console.log(`- ${e.eventType}: ${e.metadata}`);
  //}
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
