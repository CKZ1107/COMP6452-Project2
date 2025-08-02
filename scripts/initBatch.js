// scripts/initBatch.js

require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const RPC_URL      = process.env.RPC_URL || "http://127.0.0.1:8545";
const OWNER_PK     = (process.env.OWNER_PK || "").trim();
const FARMER_PK    = (process.env.FARMER_PK || "").trim();
const INSPECTOR_PK = (process.env.INSPECTOR_PK || "").trim();
const BATCH_ID     = process.env.BATCH_ID || "BATCH001";

const deployed = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../deployed.json"), "utf8")
);
const roleMgrAddr = deployed.RoleManager;
const { abi } = require("../artifacts/contracts/roleManager.sol/RoleManager.json");

function assertPk(name, pk) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(pk)) throw new Error(`${name} invalid. Check .env`);
}

async function ensureContract(provider, addr) {
  const code = await provider.getCode(addr);
  if (code === "0x") throw new Error(`No contract at ${addr} on RPC ${RPC_URL}`);
}

async function ensureRole(contractAsOwner, addr, expectedRole, label) {
  const cur = await contractAsOwner.getRole(addr);
  const curNum = typeof cur === "bigint" ? Number(cur) : cur;
  if (curNum === expectedRole) {
    console.log(`• ${label} already has role ${expectedRole}, skip`);
    return false; // no tx sent
  }
  const tx = await contractAsOwner.registerActor(addr, expectedRole);
  await tx.wait();
  console.log(`✓ ${label} registered (role=${expectedRole})`);
  return true;
}

(async () => {
  assertPk("OWNER_PK", OWNER_PK);
  assertPk("FARMER_PK", FARMER_PK);
  assertPk("INSPECTOR_PK", INSPECTOR_PK);

  const provider  = new ethers.JsonRpcProvider(RPC_URL);
  const owner     = new ethers.Wallet(OWNER_PK, provider);
  const farmer    = new ethers.Wallet(FARMER_PK, provider);
  const inspector = new ethers.Wallet(INSPECTOR_PK, provider);

  const net = await provider.getNetwork();
  console.log("RPC       :", RPC_URL, "chainId:", Number(net.chainId));
  console.log("RoleMgr   :", roleMgrAddr);
  console.log("Owner     :", await owner.getAddress());
  console.log("Farmer    :", await farmer.getAddress());
  console.log("Inspector :", await inspector.getAddress());

  await ensureContract(provider, roleMgrAddr);


  const ownerNM = new ethers.NonceManager(owner);
  const cOwner  = new ethers.Contract(roleMgrAddr, abi, ownerNM);
  const cFarmer = cOwner.connect(farmer);

 
  await ensureRole(cOwner, await farmer.getAddress(),    1, "FARMER");
  await ensureRole(cOwner, await inspector.getAddress(), 2, "INSPECTOR");

 
  const exists = await cOwner.batches(BATCH_ID);
  if (exists) {
    console.log(`• Batch "${BATCH_ID}" already exists, skip registerBatch`);
  } else {
    const tx = await cFarmer.registerBatch(BATCH_ID, 10, 15);
    await tx.wait();
    console.log(`✓ Batch "${BATCH_ID}" registered by FARMER`);
  }

  console.log("Init done.");
})().catch((e) => {
  console.error("ERROR:", e.reason || e.message || e);
  process.exit(1);
});



