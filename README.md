# COMP6452 Project – RoleManager Smart Contract

This project contains the `RoleManager.sol` smart contract for managing actor roles, batch registration, and event recording in a blockchain-based fruit supply chain system.

## 🧑‍💻 Prerequisites

- Node.js (v16 or above)
- NPM
- Git
- Hardhat (installed via NPM)

## 🚀 Getting Started

### 1. Clone the Repository onto local machine

### 2. Compile Contracts
npx hardhat compile

### 3. Start Local blockchain
In terminal 1, run:
npx hardhat node

### 4. Deploy smart contract and simulate workflow
In terminal 2, run:
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/simulateWorkflow.js --network localhost
    -- This registers a farmer and inspector, registers a batch "BATCH001"
    -- It also records harvest and inspection events

### 5. Start Violation Event Listener
In terminal 3, run:
node scripts/savetofile.js --network localhost

### 6. Report a Temperature Violation
In terminal 2, run:
npx hardhat run scripts/reportViolation.js --network localhost
    -- This simulates the inspector reporting an over-threshold temperature (12°C) for BATCH001.

### 7. Look up scripts
Also in terminal 2, run:
For coldChainAlert_lookup.js:
node scripts/coldChainAlert_lookup.js all
    -- list all recorded temperature violations
node scripts/coldChainAlert_lookup.js count
    -- show how many violations have been recorded
node scripts/coldChainAlert_lookup.js config
    -- show the ColdChainAlert contract config (threshold, linked RoleManager)

For roleManager_lookup.js:
node scripts/roleManager_lookup.js batch-events BATCH001
    -- show all events recorded for a specific batch
node scripts/roleManager_lookup.js batch-exists BATCH001
    -- Check if a batch exists
node scripts/roleManager_lookup.js owner
    -- Check who owns the roleManager contract

### 8. Run unit tests
npx hardhat test

### 9. To reset the environment
run:
npx hardhat clean
npx hardhat compile
npx hardhat node



# IPFS Integration – Upload and CID Registration
This section describes how to upload metadata to IPFS via NFT.Storage and register the resulting CID on-chain.

## 🧑‍💻 Prerequisites
- Node.js (v16 or above)
- NPM
- Git
- Hardhat (installed via NPM)
- .env file with the following fields:
RPC_URL=http://127.0.0.1:8545
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1NDE3NWFiMy1lMzEwLTQ5YzItYTJlNi00N2Q3ZjFkMGNjNjciLCJlbWFpbCI6Inl1cm9uZ3k5MUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZWI5NWEwZGRlMTAxZjdmNmVlMmMiLCJzY29wZWRLZXlTZWNyZXQiOiIzNDU0YWMwNzIxOTk2NzQxODAxNjkwYTk5NmQxMDNhZDkxZjgwNmVjMjc3NTlkYjFlNzdlYzcyODRjZTkwMDViIiwiZXhwIjoxNzg1NTAzNTIxfQ.0BCQTXF4A6HJYTmzFd_-VZCWZTW8x_QoJoSdgjuf6TY
OWNER_PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
FARMER_PK=0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
INSPECTOR_PK=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
BATCH_ID=BATCH001

## 🚀 Getting Started

### 1. Clone the Repository onto local machine 

### 2. Compile Contracts
npx hardhat compile

### 3. Start Local blockchain
In Terminal 1, run:
npx hardhat node

### 4. Deploy Smart Contract
In Terminal 2, run:
npx hardhat run scripts/deploy.js --network localhost

### 5. Register Batch (e.g., BATCH001)
run:
npx hardhat run scripts/initBatch.js --network localhost

### 6. Record Events
run:
node scripts/seedThreeEvents.js
- HARVEST event by Farmer
- INSPECTION event by Inspector
- CID_UPLOAD event referencing the uploaded IPFS CID

### 7.  View Batch Events 
run:
node scripts/roleManager_lookup.js batch-events BATCH001

### 8.  Upload Violation Report to IPFS (via Pinata)
run:
node scripts/uploadToIPFS.js
- Uploads data/violations.json to IPFS
- Saves the CID to uploads/violations.cid for later use

### 9. Register the CID on Chain
npx hardhat run scripts/reportViolation.js --network localhost

### 10. Start Local Listener
node scripts/savetofile.js --network localhost
This listens for violation events and writes them to data/violations.json.

 




