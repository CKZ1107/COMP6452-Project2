const hre = require("hardhat");
const fs = require("fs");

async function main() {
  //Deploy for rolemanager
  const RoleManager = await hre.ethers.getContractFactory("RoleManager");
  const roleManager = await RoleManager.deploy();
  await roleManager.waitForDeployment(); // ✅ Ensure it's fully deployed
  const address = await roleManager.getAddress(); // ✅ Use getAddress() for Hardhat v2.21+
  console.log("✅ RoleManager deployed to:", address);
  
  //Deploy for ColdChainAlert
  const ColdChainAlert = await hre.ethers.getContractFactory("ColdChainAlert");
  const alert = await ColdChainAlert.deploy(address);
  await alert.waitForDeployment();
  const alertAddress = await alert.getAddress();
  console.log("✅ ColdChainAlert deployed to:", alertAddress);

  const deployed = {
    RoleManager: address,
    ColdChainAlert: alertAddress
  };

  fs.writeFileSync("deployed.json", JSON.stringify(deployed, null, 2));
  console.log("📦 Saved to deployed.json");
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
