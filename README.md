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

### 4. Deploy smart contract
In terminal 2, run:
npx hardhat run scripts/deploy.js --network localhost

### 5. Simulate workflow
In terminal 3, run:
npx hardhat run scripts/simulateWorkflow.js --network localhost

### 6. Run unit tests
npx hardhat test

