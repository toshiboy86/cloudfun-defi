'use client';

import { useRouter } from 'next/navigation';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSpotify } from '../contexts/SpotifyContext';
import { formatAddressForDisplay } from '../lib/address';
import { useEthBalance } from '../hooks/useEthBalance';
import { useLPTokenBalance } from '../hooks/useLPTokenBalance';
import { useDepositTokenBalance } from '../hooks/useDepositTokenBalance';

interface SharedHeaderProps {
  showBackButton?: boolean;
  poolAddress?: string;
}

export function SharedHeader({ showBackButton = false, poolAddress }: SharedHeaderProps) {
  const router = useRouter();
  const { user, logout: logoutWallet } = usePrivy();
  
  const { setAccessToken } = useSpotify();
  const { balance: ethBalance, loading: ethLoading } = useEthBalance();
  const { balance: ausdcBalance, loading: ausdcLoading } = useDepositTokenBalance();

  const handleBackClick = () => {
    router.back();
  };

  const handleLogout = () => {
    // Logout from Spotify
    setAccessToken(null);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('spotify_refresh_token');

    // Logout from wallet
    logoutWallet();

    // Redirect to login page
    router.push('/');
  };

  return (
    <header className="flex justify-between items-center p-6 bg-white border-b">
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <button
            onClick={handleBackClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              <path d="M12 14c.83 0 1.5-.67 1.5-1.5S12.83 11 12 11s-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"/>
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            FanVest Protocol
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Wallet</span>
            <span className="text-sm font-medium text-gray-700">
              {formatAddressForDisplay(user?.wallet?.address)}
            </span>
          </div>
          {user?.wallet?.address && (
            <a
              href={`https://sepolia.etherscan.io/address/${user.wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
              title="View on Sepolia Etherscan"
            >
              <svg
                className="w-4 h-4 text-gray-500 hover:text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
        
        {/* ETH Balance */}
        <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-lg">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2L3 7v11h14V7l-7-5zM8 15v-3h4v3H8z"/>
          </svg>
          <div className="flex flex-col">
            <span className="text-xs text-blue-600">ETH (Sepolia)</span>
            <span className="text-sm font-bold text-blue-800">
              {ethLoading ? '...' : `${ethBalance} ETH`}
            </span>
          </div>
        </div>
         {/* AAVE Balance */}
         <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
          </svg>
          <div className="flex flex-col">
            <span className="text-xs text-green-600">Aave</span>
            <span className="text-sm font-bold text-green-800">
              {ausdcLoading ? '...' : `${ausdcBalance} AAVE`}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors duration-200"
          title="Logout from wallet and Spotify"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}
