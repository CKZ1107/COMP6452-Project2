require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load ENV variables
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const OWNER_PK = (process.env.OWNER_PK || "").trim();
const FARMER_PK = (process.env.FARMER_PK || "").trim();
const INSPECTOR_PK = (process.env.INSPECTOR_PK || "").trim();
const BATCH_ID = process.env.BATCH_ID || "BATCH001";

// Load deployed contract address and ABI
const deployed = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../deployed.json"), "utf8"));
const contractAddr = deployed.RoleManager;
const abi = require("../artifacts/contracts/roleManager.sol/RoleManager.json").abi;

// Read CID from uploaded file
const cid = fs.readFileSync(path.resolve(__dirname, "../uploads/violations.cid"), "utf8").trim();

function assertPk(name, pk) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(pk)) {
    throw new Error(`${name} invalid. Check .env`);
  }
}

(async () => {
  assertPk("OWNER_PK", OWNER_PK);
  assertPk("FARMER_PK", FARMER_PK);
  assertPk("INSPECTOR_PK", INSPECTOR_PK);

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const farmer = new ethers.Wallet(FARMER_PK, provider);
  const inspector = new ethers.Wallet(INSPECTOR_PK, provider);

  console.log("RPC       :", RPC_URL);
  console.log("RoleMgr   :", contractAddr);
  console.log("Farmer    :", await farmer.getAddress());
  console.log("Inspector :", await inspector.getAddress());

  const contract = new ethers.Contract(contractAddr, abi, provider);
  const rmFarmer = contract.connect(farmer);
  const rmInspector = contract.connect(inspector);

  // Get base nonce for inspector (used for events 2 and 3)
  const baseNonce = await provider.getTransactionCount(inspector.address);

  // 1. Harvest event by Farmer
  try {
    const tx1 = await rmFarmer.recordEvent(
      farmer.address,
      BATCH_ID,
      "HARVEST",
      "Organic apples harvested"
    );
    await tx1.wait();
    console.log("✓ HARVEST event recorded");
  } catch (e) {
    console.error("✗ Failed to record HARVEST:", e.reason || e.message);
  }

  // 2. Inspection event by Inspector
  try {
    const tx2 = await rmInspector.recordEvent(
      inspector.address,
      BATCH_ID,
      "INSPECTION",
      "Inspected and certified",
      { nonce: baseNonce }
    );
    await tx2.wait();
    console.log("✓ INSPECTION event recorded");
  } catch (e) {
    console.error("✗ Failed to record INSPECTION:", e.reason || e.message);
  }

  // 3. CID Upload event by Inspector
  try {
    const tx3 = await rmInspector.recordEvent(
      inspector.address,
      BATCH_ID,
      "CID_UPLOAD",
      cid,
      { nonce: baseNonce + 1 }
    );
    await tx3.wait();
    console.log("✓ CID_UPLOAD event recorded");
  } catch (e) {
    console.error("✗ Failed to record CID_UPLOAD:", e.reason || e.message);
  }

  console.log("✅ All events submitted (if no errors above).");
})();


