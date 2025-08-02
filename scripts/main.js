const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { ethers } = require('ethers');
const { getAddress } = require("ethers");
require('dotenv').config();

const deployed = JSON.parse(fs.readFileSync('deployed.json'));
const roleManagerAbi = require('../artifacts/contracts/roleManager.sol/RoleManager.json').abi;
const coldChainAbi = require('../artifacts/contracts/ColdChainAlert.sol/ColdChainAlert.json').abi;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");

async function getContract(name, abi, pk) {
  const wallet = new ethers.Wallet(pk, provider);
  return new ethers.Contract(deployed[name], abi, wallet);
}

async function registerActor() {
  const answers = await inquirer.prompt([
    { name: 'ownerPk', message: 'Private key of CONTRACT OWNER:', type: 'password' },
    { name: 'targetAddress', message: 'Address of actor to register:', type: 'input' },
    { name: 'role', message: 'Role (1=Farmer, 2=Inspector, 3=Transporter):', type: 'input' }
  ]);

  const contract = await getContract("RoleManager", roleManagerAbi, answers.ownerPk);
  const addr = getAddress(answers.targetAddress.trim()); // Ensures it's valid
  const tx = await contract.registerActor(addr, parseInt(answers.role));
  //const tx = await contract.registerActor(answers.targetAddress, parseInt(answers.role));
  await tx.wait();
  console.log('✅ Registered:', answers.targetAddress);
}

async function registerBatch() {
  const answers = await inquirer.prompt([
    { name: 'pk', message: 'Private key of FARMER:', type: 'password' },
    { name: 'batchId', message: 'Batch ID:', type: 'input' },
    { name: 'tempMin', message: 'Min safe temperature (e.g., 10):', type: 'input' },
    { name: 'tempMax', message: 'Max safe temperature (e.g., 15):', type: 'input' }
  ]);

  const contract = await getContract("RoleManager", roleManagerAbi, answers.pk);
  const wallet = new ethers.Wallet(answers.pk, provider);
  const addr = await wallet.getAddress();

  const tx = await contract.registerBatch(
    answers.batchId,
    parseInt(answers.tempMin),
    parseInt(answers.tempMax)
  );
  await tx.wait();
  console.log(`✅ Batch "${answers.batchId}" registered by ${addr}`);
}

async function recordEvent() {
  const answers = await inquirer.prompt([
    { name: 'pk', message: 'Private key of actor:', type: 'password' },
    { name: 'batchId', message: 'Batch ID:', type: 'input' },
    { name: 'eventType', message: 'Event type (e.g., HARVEST / INSPECTION):', type: 'input' },
    { name: 'metadata', message: 'Metadata (e.g., "Organic apples harvested"):', type: 'input' }
  ]);

  const contract = await getContract("RoleManager", roleManagerAbi, answers.pk);
  const wallet = new ethers.Wallet(answers.pk);
  const addr = await wallet.getAddress();

  const tx = await contract.recordEvent(addr, answers.batchId, answers.eventType.toUpperCase(), answers.metadata);
  await tx.wait();
  console.log('✅ Event recorded');
}

async function reportTemperature() {
  const answers = await inquirer.prompt([
    { name: 'pk', message: 'Private key of INSPECTOR:', type: 'password' },
    { name: 'batchId', message: 'Batch ID:', type: 'input' },
    { name: 'temp', message: 'Temperature in °C:', type: 'input' },
  ]);

  const contract = await getContract("ColdChainAlert", coldChainAbi, answers.pk);

  const tx = await contract.reportTemperature(answers.batchId, parseFloat(answers.temp));
  await tx.wait();
  console.log('✅ Temperature violation reported');
}

async function uploadToIPFS() {
  const pinataSDK = require('@pinata/sdk');
  const FILE_PATH = path.resolve(__dirname, '../data/violations.json');
  const CID_PATH = path.resolve(__dirname, '../uploads/violations.cid');
  const JWT = process.env.PINATA_JWT;

  if (!fs.existsSync(FILE_PATH)) return console.error('❌ violations.json not found');

  const pinata = new pinataSDK({ pinataJWTKey: JWT });

  console.log('📤 Uploading...');
  const stream = fs.createReadStream(FILE_PATH);
  const res = await pinata.pinFileToIPFS(stream, {
    pinataMetadata: { name: 'violations.json' }
  });

  fs.mkdirSync(path.dirname(CID_PATH), { recursive: true });
  fs.writeFileSync(CID_PATH, res.IpfsHash + "\n");
  console.log('✅ Uploaded to IPFS. CID saved to uploads/violations.cid');
}

async function main() {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message: '📦 Cold Chain Blockchain CLI\nSelect an action:',
        choices: [
          'Register actor',
          'Register batch',
          'Record event',
          'Report temperature violation',
          'Upload violations.json to IPFS',
          'Exit',
        ],
      }
    ]);

    if (action === 'Register actor') await registerActor();
    else if (action === 'Register batch') await registerBatch();
    else if (action === 'Record event') await recordEvent();
    else if (action === 'Report temperature violation') await reportTemperature();
    else if (action === 'Upload violations.json to IPFS') await uploadToIPFS();
    else break;

    console.log('\n'); // spacing between runs
  }

  console.log('👋 Goodbye!');
}

main();