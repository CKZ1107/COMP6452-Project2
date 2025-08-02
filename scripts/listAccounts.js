const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  for (let i = 0; i < signers.length; i++) {
    console.log(`Account ${i}: ${signers[i].address}`);
  }
}

main();