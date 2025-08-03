
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// ---------- config ----------
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const DEFAULT_BATCH_ID = process.env.BATCH_ID || 'BATCH001';

const deployed = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../deployed.json'), 'utf8')
);
const ROLE_MANAGER_ADDR = deployed.RoleManager;

const abi = require('../artifacts/contracts/roleManager.sol/RoleManager.json').abi;


const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(ROLE_MANAGER_ADDR, abi, provider);

const toNum  = (v) => (typeof v === 'bigint' ? Number(v) : v);
const roles  = ['NONE', 'FARMER', 'INSPECTOR', 'TRANSPORTER'];
const label  = (s) => ({
  HARVEST: 'Harvest',
  INSPECTION: 'Inspection',
  CID_UPLOAD: 'CID Upload',
}[(s || '').toUpperCase()] || `Unknown(${s})`);

async function ensureContract() {
  const code = await provider.getCode(ROLE_MANAGER_ADDR);
  if (code === '0x') {
    throw new Error(`No contract at ${ROLE_MANAGER_ADDR} on ${RPC_URL}`);
  }
}

function usage() {
  console.log('Usage:');
  console.log('  node scripts/roleManager_lookup.js batch-events <BATCHID?>');
  console.log('  node scripts/roleManager_lookup.js user-role   <ADDRESS>');
  console.log('  node scripts/roleManager_lookup.js batch-exists <BATCHID?>');
  console.log('  node scripts/roleManager_lookup.js owner');
}


async function cmdBatchEvents(batchIdArg) {
  const batchId = batchIdArg || DEFAULT_BATCH_ID;
  await ensureContract();

  const events = await contract.getEvents(batchId);

  if (!events || events.length === 0) {
    console.log(`No events found for batch ${batchId}`);
    return;
  }

  const sortedEvents = [...events].sort((a, b) => toNum(a.timestamp) - toNum(b.timestamp));

  const net = await provider.getNetwork();
  console.log(`RPC: ${RPC_URL} chainId: ${Number(net.chainId)}`);
  console.log(`RoleManager: ${ROLE_MANAGER_ADDR}`);
  console.log(`=== ${batchId} — ${sortedEvents.length} event(s) ===`);

  sortedEvents.forEach((e, i) => {
    const ts = new Date(toNum(e.timestamp) * 1000).toLocaleString();
    const roleIdx = toNum(e.actorRole);
    console.log(`Event #${i + 1}:`);
    console.log(`  type:      ${label(e.eventType)}`);
    console.log(`  metadata:  ${e.metadata}`);
    console.log(`  timestamp: ${ts}`);
    console.log(`  actorRole: ${roles[roleIdx] || roleIdx}`);
    console.log(`  actor:     ${e.actor}\n`);
  });
}

async function cmdUserRole(address) {
  if (!address) return usage();
  await ensureContract();
  const r = await contract.getRole(address);
  const idx = toNum(r);
  console.log(`Role of ${address}: ${roles[idx] ?? idx}`);
}

async function cmdBatchExists(batchIdArg) {
  const batchId = batchIdArg || DEFAULT_BATCH_ID;
  await ensureContract();
  const batch = await contract.batches(batchId);
  console.log(`Batch ${batchId} registered?`, batch.exists);
}

async function cmdOwner() {
  await ensureContract();
  console.log('Contract owner:', await contract.owner());
}


(async () => {
  try {
    const [cmd, arg] = process.argv.slice(2);

    switch (cmd) {
      case 'batch-events': await cmdBatchEvents(arg); break;
      case 'user-role':    await cmdUserRole(arg);    break;
      case 'batch-exists': await cmdBatchExists(arg); break;
      case 'owner':        await cmdOwner();          break;
      default:             usage();
    }
  } catch (err) {
    console.error('❌ Error:', err.reason || err.message || err);
    process.exit(1);
  }
})();



