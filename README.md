# FanVest Protocol

A decentralized crowdfunding platform that allows fans to collectively invest in their favorite musicians and share in their future success through tokenized streaming royalties.

## 🎵 Project Overview

FanVest Protocol transforms passive music fans into active stakeholders by creating a transparent, mutually beneficial economic model for the music industry. Fans can pool funds to support their favorite artists while earning interest through DeFi protocols and sharing in the artist's future streaming success.

### Core Features

- **Artist Investment Pools**: Create dedicated funding pools for individual artists using Spotify integration
- **Fan LP Tokens**: Receive tokenized shares representing your stake in an artist's funding pool
- **DeFi Integration**: Automatic yield generation through Aave V3 lending protocol
- **Spotify Integration**: Discover and invest in artists from your personal playlists
- **Smart Wallet Support**: Account abstraction with gasless transactions via Privy and ZeroDev
- **Cross-chain Capabilities**: Multi-chain support with LiFi integration for seamless swaps
- **Oracle Data**: Real-time artist metrics and popularity data from Spotify
- **Smart Contract Security**: Built on Ethereum with OpenZeppelin standards
- **Artist Claims**: Artists can claim pooled funds plus earned interest for their projects

## 🏗️ Architecture

The project consists of three main components:

### 1. Smart Contracts (`/contract`)
- **FanVestFactory**: Central registry that deploys and manages artist pools
- **FanVestPool**: Individual artist investment pools with ERC-20 LP tokens
- **VerificationRegistry**: Artist verification system
- **Mock Contracts**: Testing utilities for USDC and Aave integration

### 2. Frontend Application (`/frontend`)
- **Next.js 15** with TypeScript and Tailwind CSS
- **Privy Authentication** with smart wallet integration
- **Spotify API Integration** for artist discovery and oracle data
- **Smart Contract Interaction** via Viem with custom hooks
- **Real-time Balance Tracking** and transaction management
- **Cross-chain Swapping** via LiFi integration
- **Gasless Transactions** with Pimlico paymaster

### 3. Development Tools
- **Hardhat 3** for smart contract development and testing
- **TypeScript** throughout the entire stack
- **Viem** for Ethereum interactions
- **Foundry** compatible testing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Git
- MetaMask or compatible wallet
- Spotify Developer Account (for frontend features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spodi-fi
   ```

2. **Install dependencies**
   ```bash
   # Install contract dependencies
   cd contract
   pnpm install

   # Install frontend dependencies
   cd ../frontend
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Contract environment
   cp contract/.env.example contract/.env
   # Add your private keys and RPC URLs

   # Frontend environment
   cp frontend/.env.example frontend/.env.local
   # Add your Spotify API credentials and contract addresses
   ```

### Development

**Smart Contracts:**
```bash
cd contract
pnpm hardhat compile
pnpm hardhat test
pnpm hardhat ignition deploy ignition/modules/deploymentSepoliaV7.ts --network sepolia
```

**Frontend:**
```bash
cd frontend
pnpm dev
```

## 📋 How It Works

1. **Artist Discovery**: Connect your Spotify account to discover artists from your playlists
2. **Pool Creation**: Create or join existing funding pools for your favorite artists
3. **Investment**: Deposit USDC to receive Fan LP tokens representing your share
4. **Yield Generation**: Pooled funds automatically earn interest through Aave V3
5. **Artist Funding**: Artists can claim the total pool value (principal + interest)
6. **Shared Success**: Fans receive tokenized shares of future streaming royalties

## 🛠️ Technology Stack

### Smart Contracts
- **Solidity ^0.8.20**
- **OpenZeppelin Contracts**
- **Aave V3 Integration**
- **Hardhat 3 with Viem**

### Frontend
- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS**
- **Privy Authentication**
- **Viem for Ethereum interactions**

### Development
- **Hardhat 3 Beta**
- **Foundry** (compatible testing)
- **TypeScript** throughout
- **pnpm** package manager

## 📁 Project Structure

```
spodi-fi/
├── contract/                 # Smart contracts
│   ├── contracts/           # Solidity contracts
│   ├── test/               # Contract tests
│   ├── scripts/            # Deployment and utility scripts
│   └── ignition/           # Hardhat Ignition deployment modules
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── public/            # Static assets
└── README.md              # This file
```

## 🔧 Available Scripts

### Contract Scripts
```bash
# Compile contracts
pnpm contract:compile

# Run tests
npx hardhat test

# Deploy to Sepolia
pnpm contract:redeploy:sepolia
```

### Frontend Scripts
```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🌐 Network Support

- **Ethereum Sepolia** (testnet)
- **Local Hardhat Network** (development)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.