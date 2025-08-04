# COMP6452 Project – RoleManager Smart Contract
This project implements a blockchain-based fruit supply chain management system. It includes:
RoleManager.sol: Manages actor roles, batch registrations and event logs
ColdChainAlert.sol: ColdChainAlert.sol: Handles temperature violation reports
A CLI tool (main.js) that lets users interactively register actors, batches, events, and violations.

## 🧑‍💻 Prerequisites

- Node.js (v16 or above)
- NPM
- Git
- Hardhat (installed via NPM)

## 🚀 Getting Started

### 1. Clone the Repository onto local machine
git clone https://github.com/CKZ1107/COMP6452-Project2.git
cd COMP6452-Project2
npm install

### 2. Compile Contracts
npx hardhat compile

### 3. Start Local blockchain
In terminal 1, run:
npx hardhat node

### 4. Deploy smart contract and simulate workflow
In terminal 2, run:
npx hardhat run scripts/deploy.js --network localhost

### 5. Launch CLI Interface
Also in terminal 2, run:
node scripts/main.js
Interactively perform the following actions:
    -   Register actors (Farmer, Inspector, Transporter)
    -   Register batches with custom temperature thresholds
    -   Record events (e.g. HARVEST / INSPECTION)
    -   Report temperature violations
    -   Upload violation logs to IPFS

### 6. Start Violation Event Listener
In terminal 3, run:
node scripts/savetofile.js --network localhost

### 7. Look up scripts
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

## NOTES
 - All CLI interactions use ethers.js and inquirer
 - Events are timestamped and include role/address
 - Temperature thresholds are stored per batch
 - IPFS integration uses Pinata via JWT
 - To access the log page, type in the web browser
 https://ipfs.io/ipfs/{CID}


 




