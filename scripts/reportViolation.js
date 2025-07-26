// scripts/reportViolation.js
require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  const inspector = signers[2];
  console.log("🔍 Inspector address:", inspector.address);

  const deployed = JSON.parse(fs.readFileSync("deployed.json"));
  const coldChainAlertAddress = deployed.ColdChainAlert;
  const roleManagerAddress = deployed.RoleManager;

  // Load ABIs
  const coldChainAbi = require("../artifacts/contracts/ColdChainAlert.sol/ColdChainAlert.json").abi;
  const roleManagerAbi = require("../artifacts/contracts/RoleManager.sol/RoleManager.json").abi;

  // Instantiate contracts
  const alert = new hre.ethers.Contract(coldChainAlertAddress, coldChainAbi, inspector);
  const roleManager = new hre.ethers.Contract(roleManagerAddress, roleManagerAbi, inspector);

  // Double check that ColdChainAlert is using the expected RoleManager
  const linkedRoleManager = await alert.roleManager();
  console.log("🔗 ColdChainAlert is using RoleManager at:", linkedRoleManager);
  if (linkedRoleManager.toLowerCase() !== roleManagerAddress.toLowerCase()) {
    console.error("❌ Mismatch: ColdChainAlert is linked to a different RoleManager");
    return;
  }

  // Check inspector's role
  const role = await roleManager.getRole(inspector.address);
  console.log("🧾 Inspector's role in RoleManager:", role.toString());
  if (role.toString() !== "2") {
    console.error("❌ Inspector is NOT registered with role ID 2. Aborting.");
    return;
  }

  // Report temperature
  const batchId = "BATCH001";
  const temperature = 12;
  console.log(`📡 Reporting temperature ${temperature}°C for batch ${batchId}...`);

  const tx = await alert.reportTemperature(batchId, temperature);
  await tx.wait();

  console.log("✅ Temperature violation reported successfully.");
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err.message || err);
  process.exit(1);
});
