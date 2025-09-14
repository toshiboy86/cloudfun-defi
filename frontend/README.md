# FanVest Protocol Frontend

A modern Next.js 15 application that provides the user interface for the FanVest Protocol, allowing fans to discover, invest in, and support their favorite musicians through decentralized crowdfunding.

## 🎵 Features

### Core Functionality
- **Spotify Integration**: Connect your Spotify account to discover artists from your playlists
- **Artist Discovery**: Browse and explore artists with detailed information including followers, popularity, and funding status
- **Investment Interface**: Deposit USDC to receive Fan LP tokens representing your stake in artist pools
- **Real-time Balance Tracking**: Monitor your USDC and LP token balances across all pools
- **Transaction Management**: Seamless interaction with smart contracts through wallet integration

### User Experience
- **Modern UI**: Built with Tailwind CSS and a retro 70s Californian music scene aesthetic
- **Responsive Design**: Optimized for desktop and mobile devices
- **Wallet Integration**: Secure authentication and transaction signing with Privy
- **Real-time Updates**: Live balance and pool information updates

## 🏗️ Architecture

### Technology Stack
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Privy** for wallet authentication
- **Viem** for Ethereum interactions
- **Spotify Web API** for artist data

### Key Components

#### Pages
- **Home Page** (`/`): Artist discovery and login interface
- **Artist List** (`/list`): Browse all available artists and pools
- **Artist Detail** (`/artist/[id]`): Individual artist pages with funding interface
- **Admin Panel** (`/admin`): Pool management and analytics
- **Admin Claim** (`/admin/[id]/claim`): Artist claim interface for pooled funds

#### Components
- **Authentication**: Privy-based wallet connection with smart wallet support
- **Artist Cards**: Display artist information and funding status
- **Artist Profile**: Detailed artist information display
- **Artist Funding**: Investment interface for deposits and withdrawals
- **Artist Claim**: Artist claim interface for pooled funds
- **Funding Overview Cards**: Pool statistics and metrics display
- **Claim Overview Cards**: Claim status and earnings display
- **Balance Aggregator**: Real-time balance tracking across all pools
- **Spotify OAuth**: Spotify account integration
- **Spotify Data Explorer**: Artist data visualization
- **Transaction Components**: Smart contract interaction interfaces
- **Wallet Provider**: Privy wallet configuration and management

#### Hooks
- **useFanVestFactory**: Factory contract interactions
- **useFanVestPool**: Individual pool contract interactions
- **useSmartContract**: Main hook for contract interactions
- **useCreatePool**: Pool creation functionality
- **useDepositTokenBalance**: Deposit token balance tracking
- **useEthBalance**: Ethereum balance tracking
- **useLPTokenBalance**: LP token balance management
- **useUSDCBalance**: USDC balance tracking
- **usePrivy**: Wallet authentication and connection
- **useSmartAccount**: Smart wallet operations and cross-chain swaps

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm package manager
- MetaMask or compatible wallet
- Spotify Developer Account

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback

# Smart Contract Addresses
NEXT_PUBLIC_FANVEST_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_AAVE_POOL_ADDRESS=0x...
NEXT_PUBLIC_AUSDC_ADDRESS=0x...

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia
NEXT_PUBLIC_RPC_URL=your_rpc_url
```

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 User Flow

### 1. Authentication
- Connect wallet using Privy
- Sign in with Spotify to access artist data

### 2. Artist Discovery
- Browse artists from your Spotify playlists
- View artist information including followers, popularity, and funding status
- See which artists already have funding pools

### 3. Investment
- Select an artist to view their dedicated page
- See total funded amount, earned interest, and number of fans
- Deposit USDC to receive Fan LP tokens
- Monitor your LP token balance

### 4. Pool Management
- View your investments across all pools
- Withdraw funds by burning LP tokens
- Track earned interest and total returns

## 🔧 API Routes

### Spotify Integration
- `/api/spotify/auth` - Spotify OAuth initiation
- `/api/spotify/callback` - OAuth callback handler
- `/api/spotify/followed-artists` - Get user's followed artists
- `/api/spotify/artist/[id]` - Get specific artist information
- `/api/spotify/oracle` - Oracle endpoint for public artist data
- `/api/spotify/token` - Token management for Spotify API

### Smart Contract Integration
- `/api/balances` - Get user's token balances
- `/api/smart-account` - Smart account management
- `/api/swap` - Token swapping functionality

## 🎨 Design System

### Theme
- **Retro 70s Californian Music Scene** aesthetic
- **Warm color palette** with oranges, pinks, and gradients
- **Beach and music-inspired** visual elements

### Components
- **Artist Cards**: Clean, informative cards with funding status indicators
- **Funding Interface**: Intuitive deposit/withdraw forms
- **Balance Display**: Real-time balance tracking with clear visual hierarchy
- **Transaction Status**: Clear feedback for all blockchain interactions

## 🛠️ Development

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── balances/      # Balance tracking API
│   │   └── spotify/       # Spotify integration APIs
│   │       ├── oracle/    # Oracle data endpoint
│   │       ├── token/     # Token management
│   │       └── followed-artists/ # User artists
│   ├── artist/[id]/       # Artist detail pages
│   ├── admin/             # Admin panel
│   │   └── [id]/claim/    # Artist claim interface
│   └── list/              # Artist list page
├── components/            # React components
│   ├── ArtistCard.tsx     # Artist display component
│   ├── ArtistFunding.tsx  # Funding interface
│   ├── ArtistClaim.tsx    # Artist claim interface
│   ├── ArtistProfile.tsx  # Artist profile display
│   ├── BalanceAggregator.tsx # Balance tracking
│   ├── FundingOverviewCards.tsx # Pool metrics
│   ├── ClaimOverviewCards.tsx # Claim status
│   ├── SpotifyOAuth.tsx   # Spotify integration
│   ├── SpotifyDataExplorer.tsx # Data visualization
│   └── WalletProvider.tsx # Wallet management
├── hooks/                 # Custom React hooks
│   ├── useFanVestFactory.ts
│   ├── useFanVestPool.ts
│   ├── useSmartContract.ts # Main contract hook
│   ├── useCreatePool.ts   # Pool creation
│   ├── useSmartAccount.ts # Smart wallet operations
│   └── ...
├── lib/                   # Utility functions
│   ├── transactions.ts    # Transaction helpers
│   ├── directTransaction.ts # Direct transaction handling
│   ├── debugTransaction.ts # Debug utilities
│   └── ...
├── contexts/              # React contexts
│   └── SpotifyContext.tsx
├── config/                # Configuration
│   └── contracts.ts       # Contract addresses
└── artifacts/             # Contract ABIs
    ├── FanVestFactory.sol/
    ├── FanVestPool.sol/
    └── USDC.json
```

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Smart Account Testing
pnpm run:smart-account-pimlico        # Test Pimlico integration
pnpm run:smart-account-pimlico-sepolia # Test on Sepolia
pnpm run:stargate-swap                # Test swap functionality
```

## 🔒 Security

- **Wallet Integration**: Secure authentication through Privy
- **Transaction Signing**: All blockchain interactions require user approval
- **Input Validation**: Comprehensive validation for all user inputs
- **Error Handling**: Graceful error handling and user feedback

## 📊 Performance

- **Next.js 15**: Latest performance optimizations
- **Turbopack**: Fast development builds
- **Code Splitting**: Automatic code splitting for optimal loading
- **Image Optimization**: Optimized images and assets

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.
