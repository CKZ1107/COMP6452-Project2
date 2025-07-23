const hre = require("hardhat");

async function main() {
  const RoleManager = await hre.ethers.getContractFactory("RoleManager");
  const roleManager = await RoleManager.deploy();
  await roleManager.waitForDeployment(); // ✅ Ensure it's fully deployed
  const address = await roleManager.getAddress(); // ✅ Use getAddress() for Hardhat v2.21+
  console.log("✅ RoleManager deployed to:", address);
  const fs = require("fs");
  fs.writeFileSync("deployed.json", JSON.stringify({ RoleManager: address }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
