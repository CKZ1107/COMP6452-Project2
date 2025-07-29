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

