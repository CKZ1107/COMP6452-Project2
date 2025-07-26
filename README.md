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

### 6. Run unit tests
npx hardhat test

### 7. To reset the environment
run:
npx hardhat clean
npx hardhat compile
npx hardhat node

