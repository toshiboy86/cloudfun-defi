'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'your-privy-app-id'}
      config={{
        // Support MetaMask and other wallets
        loginMethods: [
          'wallet',
          'email',
          // 'google',
          // 'twitter',
          // 'farcaster',
          // 'spotify',
        ],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        // Enable smart wallet features
        embeddedWallets: {
          createOnLogin: 'all-users', // Create embedded wallets for all users
          requireUserPasswordOnCreate: false,
          noPromptOnSignature: false,
        },
        // Note: OAuth scopes are configured in the Privy dashboard
        // Make sure to configure Spotify OAuth with the following scopes:
        // - user-read-private
        // - user-read-email
        // - user-library-read
        // - user-top-read
        // - user-read-recently-played
        // - user-read-playback-state
        // - user-modify-playback-state
        // - playlist-read-private
        // - playlist-read-collaborative
        // Support Sepolia testnet (Ethereum)
        defaultChain: {
          id: 11155111, // Sepolia
          name: 'Sepolia',
          network: 'sepolia',
          nativeCurrency: {
            decimals: 18,
            name: 'Ethereum',
            symbol: 'ETH',
          },
          rpcUrls: {
            default: { http: ['https://rpc.sepolia.org'] },
            public: { http: ['https://rpc.sepolia.org'] },
          },
          blockExplorers: {
            default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
          },
        },
        supportedChains: [
          {
            id: 11155111, // Sepolia
            name: 'Sepolia',
            network: 'sepolia',
            nativeCurrency: {
              decimals: 18,
              name: 'Ethereum',
              symbol: 'ETH',
            },
            rpcUrls: {
              default: { http: ['https://rpc.sepolia.org'] },
              public: { http: ['https://rpc.sepolia.org'] },
            },
            blockExplorers: {
              default: {
                name: 'Etherscan',
                url: 'https://sepolia.etherscan.io',
              },
            },
          },
          // {
          //   id: 84532, // Base Sepolia
          //   name: 'Base Sepolia',
          //   network: 'base-sepolia',
          //   nativeCurrency: {
          //     decimals: 18,
          //     name: 'Ethereum',
          //     symbol: 'ETH',
          //   },
          //   rpcUrls: {
          //     default: { http: ['https://sepolia.base.org'] },
          //     public: { http: ['https://sepolia.base.org'] },
          //   },
          //   blockExplorers: {
          //     default: {
          //       name: 'BaseScan',
          //       url: 'https://sepolia.basescan.org',
          //     },
          //   },
          // },
        ],
      }}
    >
      <SmartWalletsProvider>{children}</SmartWalletsProvider>
    </PrivyProvider>
  );
}
