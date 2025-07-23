const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer, farmer, inspector] = await hre.ethers.getSigners();
  const RoleManager = await hre.ethers.getContractFactory("RoleManager");
  const deployed = JSON.parse(fs.readFileSync("deployed.json"));
  const roleManager = await hre.ethers.getContractAt("RoleManager", deployed.RoleManager);
  console.log("Using existing RoleManager at:", await roleManager.getAddress());
  await roleManager.waitForDeployment();

  const address = await roleManager.getAddress();
  console.log("🚀 Contract deployed:", address);

  // Register actors
  await roleManager.registerActor(farmer.address, 1); // FARMER
  await roleManager.registerActor(inspector.address, 2); // INSPECTOR
  console.log("✅ Actors registered");

  // Farmer registers batch
  await roleManager.connect(farmer).registerBatch("BATCH001");
  console.log("📦 Batch registered");

  // Farmer adds event
  await roleManager.connect(farmer).recordEvent("BATCH001", "Harvest", "Organic apples harvested");
  console.log("📝 Harvest event recorded");

  // Inspector adds event
  await roleManager.connect(inspector).recordEvent("BATCH001", "Inspection", "Inspected and certified");
  console.log("📝 Inspection event recorded");

  // View events
  const events = await roleManager.getEvents("BATCH001");
  console.log("📜 Batch Events:");
  for (let e of events) {
    console.log(`- ${e.eventType}: ${e.metadata}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
