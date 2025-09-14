# FanVest Protocol Smart Contracts

This directory contains the smart contracts for the FanVest Protocol, a decentralized crowdfunding platform that allows fans to invest in their favorite musicians and share in their future success.

## 🎵 Contract Overview

The FanVest Protocol consists of several smart contracts that work together to create a decentralized investment platform for music artists:

### Core Contracts

- **FanVestFactory**: Central registry that deploys and manages individual artist pools
- **FanVestPool**: Individual artist investment pools with ERC-20 LP tokens
- **VerificationRegistry**: Artist verification and authentication system

### Mock Contracts (Testing)

- **MockUSDC**: Test USDC token for development and testing
- **MockAavePool**: Mock Aave V3 Pool for testing DeFi integration
- **MockAUSDC**: Mock Aave USDC token for testing

## 🏗️ Architecture

### FanVestFactory
The factory contract serves as the central registry and deployment mechanism:
- Deploys new `FanVestPool` contracts for individual artists
- Tracks all created pools by Spotify Artist ID
- Manages unique holder tracking across all pools
- Provides query functions for pool discovery

### FanVestPool
Each artist gets their own pool contract that:
- Acts as an ERC-20 token for "Fan LP" shares
- Manages USDC deposits and withdrawals
- Automatically invests pooled funds in Aave V3 for yield generation
- Allows artists to claim pooled funds plus earned interest
- Tracks total assets including liquid USDC and aUSDC from Aave

### Key Features

- **1:1 USDC to LP Token Ratio**: Simple and transparent pricing
- **Automatic DeFi Integration**: Funds are automatically deposited into Aave V3
- **Yield Generation**: Pooled funds earn interest through Aave lending
- **Fair Withdrawal**: Users receive their proportional share of total pool assets
- **Artist Claims**: Artists can claim the entire pool value (principal + interest)
- **Emergency Functions**: Safety mechanisms for unexpected situations

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- pnpm package manager
- Git

### Installation

```bash
# Install dependencies
pnpm install

# Compile contracts
pnpm hardhat compile
```

### Environment Setup

Create a `.env` file in the contract directory with the following variables:

```bash
# Network Configuration
SEPOLIA_RPC_URL=your_sepolia_rpc_url
SEPOLIA_PRIVATE_KEY=your_private_key

# Contract Addresses (for testing)
USDC_ADDRESS=0x... # USDC token address on Sepolia
AAVE_POOL_ADDRESS=0x... # Aave V3 Pool address
AUSDC_ADDRESS=0x... # Aave USDC token address
```

## 🧪 Testing

### Running Tests

Run all tests (Solidity + TypeScript):
```bash
npx hardhat test
```

Run only Solidity tests:
```bash
npx hardhat test solidity
```

Run only TypeScript integration tests:
```bash
npx hardhat test nodejs
```

### Test Coverage

The test suite includes:
- Unit tests for individual contract functions
- Integration tests for contract interactions
- Mock contract testing for DeFi integration
- Edge case and error condition testing

## 🚀 Deployment

### Local Development

Deploy to local Hardhat network:
```bash
npx hardhat ignition deploy ignition/modules/deploymentLocal.ts
```

### Sepolia Testnet

Deploy to Sepolia testnet:
```bash
npx hardhat ignition deploy --network sepolia ignition/modules/deploymentSepoliaV7.ts
```

### Setting Up Private Keys

Use Hardhat Keystore for secure key management:
```bash
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

## 📋 Contract Functions

### FanVestFactory Functions

- `createPool(spotifyArtistId, tokenName, tokenSymbol, owner)` - Deploy new artist pool
- `getPoolAddress(spotifyArtistId)` - Get pool address for artist
- `hasPool(spotifyArtistId)` - Check if pool exists
- `getPoolCount()` - Get total number of pools
- `getAllPools()` - Get all pool addresses

### FanVestPool Functions

- `deposit(amount)` - Deposit USDC and receive LP tokens
- `withdraw(lpAmount)` - Burn LP tokens and receive USDC
- `claim()` - Artist claims all pooled funds (owner only)
- `getPoolInfo()` - Get pool information and statistics
- `getTotalAssets()` - Calculate total pool value including interest

## 🔧 Scripts

### Utility Scripts

The `scripts/` directory contains various utility scripts:

#### Contract State Checking Scripts
- `check-aave-addresses.ts` - Verify Aave contract addresses
- `check-aave-addresses-simple.ts` - Simple Aave address verification
- `check-aave-supply-cap.ts` - Check Aave supply capacity
- `check-active-assets.ts` - Check active assets in Aave
- `check-contract-usdc.ts` - Verify USDC contract configuration
- `check-function-signature.ts` - Verify function signatures
- `check-init.ts` - Check contract initialization
- `check-pool.ts` - Check pool state and configuration
- `check-supported-tokens.ts` - Check supported tokens
- `check-usdc-balance.ts` - Check USDC balances
- `check-user-usdc.ts` - Check user USDC balances

#### Deployment Scripts
- `deploy-fanvest.ts` - Main FanVest deployment script
- `simple-deploy.ts` - Simplified deployment script

#### Testing and Debugging Scripts
- `debug-claim.ts` - Debug claim functionality
- `debug-invest.ts` - Debug investment functionality
- `debug-pool.ts` - Debug pool operations
- `test-mock-investment.ts` - Test mock investment scenarios
- `test-with-correct-usdc.ts` - Test with correct USDC configuration

#### Action Scripts (`actions/`)
- `claim.ts` - Artist claim functionality
- `createPool.ts` - Pool creation actions
- `deposit.ts` - Deposit functionality
- `investPool.ts` - Pool investment actions
- `withdraw.ts` - Withdrawal functionality

#### Utility Scripts
- `abi.ts` - ABI generation and management
- `deposit-usdc.ts` - USDC deposit utilities

### Running Scripts

```bash
# Check contract state
npx hardhat run scripts/check-pool.ts --network sepolia
npx hardhat run scripts/check-aave-addresses.ts --network sepolia
npx hardhat run scripts/check-usdc-balance.ts --network sepolia

# Deploy contracts
npx hardhat run scripts/deploy-fanvest.ts --network sepolia
npx hardhat run scripts/simple-deploy.ts --network sepolia

# Test functionality
npx hardhat run scripts/test-mock-investment.ts --network sepolia
npx hardhat run scripts/debug-pool.ts --network sepolia

# Run action scripts
npx hardhat run scripts/actions/createPool.ts --network sepolia
npx hardhat run scripts/actions/deposit.ts --network sepolia
npx hardhat run scripts/actions/claim.ts --network sepolia
```

## 🛡️ Security Features

- **OpenZeppelin Standards**: Uses battle-tested OpenZeppelin contracts
- **Access Control**: Owner-only functions for critical operations
- **Input Validation**: Comprehensive parameter validation
- **Emergency Functions**: Safety mechanisms for unexpected situations
- **Reentrancy Protection**: Built-in protection against reentrancy attacks

## 📊 Gas Optimization

The contracts are optimized for gas efficiency:
- Minimal storage operations
- Efficient event emissions
- Optimized function logic
- Batch operations where possible

## 🔍 Monitoring

### Events

Key events for monitoring:
- `PoolCreated` - New artist pool created
- `Deposit` - User deposited funds
- `Withdraw` - User withdrew funds
- `Claim` - Artist claimed funds

### View Functions

Use view functions to monitor contract state:
- Pool balances and statistics
- User token balances
- Total assets and interest earned
- Pool existence and addresses
