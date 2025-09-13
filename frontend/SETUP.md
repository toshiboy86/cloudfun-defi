# Balance Aggregator - Smart Wallet Frontend Setup

## Overview

This frontend integrates with your smart wallet backend to provide a user-friendly interface for:

- **Wallet Connection**: MetaMask, social logins (email, Google, Twitter)
- **Smart Account Creation**: ZeroDev-powered smart accounts
- **Cross-Chain Swapping**: LiFi integration for multi-chain swaps
- **Gasless Transactions**: Pimlico paymaster integration

## Environment Variables Required

Create a `.env.local` file in the root directory with:

```bash
# Privy Configuration (Required)
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id

# ZeroDev Configuration (Required for Smart Wallets)
NEXT_PUBLIC_ZERODEV_PROJECT_ID=your-zerodev-project-id

# Optional: WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

## Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Get Privy App ID

1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Create a new app
3. Copy your App ID to `NEXT_PUBLIC_PRIVY_APP_ID`

### 3. Get ZeroDev Project ID

1. Go to [ZeroDev Dashboard](https://dashboard.zerodev.app/)
2. Create a new project
3. Copy your Project ID to `NEXT_PUBLIC_ZERODEV_PROJECT_ID`
4. Make sure to enable Base Sepolia testnet in your ZeroDev project

### 4. Run the Application

```bash
pnpm dev
```

## Smart Wallet Features

### 🔐 **Multi-Modal Authentication**

- **MetaMask**: Traditional wallet connection
- **Social Logins**: Email, Google, Twitter for non-crypto users
- **Embedded Wallets**: Automatic wallet creation for new users

### ⚡ **Smart Account Technology**

- **ZeroDev Integration**: Account abstraction with Kernel v3.1
- **Gasless Transactions**: Pay gas with ERC-20 tokens
- **Batch Operations**: Multiple transactions in one operation

### 🌉 **Cross-Chain Capabilities**

- **LiFi Integration**: Best route finding across chains
- **Multi-Chain Support**: Ethereum, Base, Arbitrum, Optimism
- **Automatic Bridging**: Seamless cross-chain swaps

### 🛡️ **Security Features**

- **Signature Verification**: All operations require user signatures
- **Smart Contract Validation**: Backend validates all transactions
- **Gas Estimation**: Accurate fee calculation before execution

## Architecture

```
Frontend (Next.js + Privy)
    ↓
Privy Smart Wallet (ZeroDev Integration)
    ↓
LiFi SDK (Cross-chain Routing)
    ↓
Blockchain Networks (Base Sepolia/Base)
```

## Key Components

### `WalletProvider.tsx`

- Privy configuration with Base Sepolia/Base support
- Multi-modal authentication setup
- Chain configuration

### `useSmartAccount.ts`

- Custom hook for smart wallet operations
- Direct integration with Privy's smart wallet
- LiFi SDK integration for cross-chain swaps
- State management for wallet and swap operations

### `BalanceAggregator.tsx`

- Main UI component
- Wallet connection interface
- Smart account status display
- Swap interface with chain selection

### Smart Wallet Integration

- **Privy Smart Wallets**: Automatic smart wallet creation for all users
- **ZeroDev Integration**: Account abstraction with gasless transactions
- **Direct Frontend Execution**: No backend required for wallet operations

## Usage Flow

1. **User connects wallet** (MetaMask, social login, or embedded wallet)
2. **Smart wallet auto-created** (Privy + ZeroDev integration)
3. **User configures swap** (from/to chains, amount, tokens)
4. **User executes swap** (Privy handles signatures, gasless execution)
5. **Transaction processed** (cross-chain routing via LiFi)

## Development Notes

- All transactions are executed on Base Sepolia testnet
- Smart wallets use Privy's ZeroDev integration
- Gas fees are sponsored by ZeroDev paymaster
- Cross-chain routing handled by LiFi SDK
- Frontend uses Tailwind CSS for styling
- No backend required - all operations handled by Privy

## Production Considerations

- Move to Base mainnet for production
- Configure ZeroDev for mainnet deployment
- Add database storage for user transaction history
- Implement proper error handling and user feedback
- Add transaction history and status tracking
- Consider implementing rate limiting for API calls
