'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useSpotify } from '../contexts/SpotifyContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SpotifyOAuth } from './SpotifyOAuth';
import { formatAddressForDisplay } from '@/lib/address';

export function LoginPage({ artistId }: { artistId?: string }) {
  const { user, login, authenticated } = usePrivy();
  const { accessToken, isConnected } = useSpotify();
  const router = useRouter();

  console.log('artistId', artistId);

  // Check if both authentications are complete and redirect
  useEffect(() => {
    if (authenticated && isConnected) {
      if (artistId) {
        router.push(`/admin/${artistId}/claim`);
      } else {
        router.push('/list');
      }
    }
  }, [authenticated, isConnected, router, artistId]);

  const handleWalletLogin = () => {
    if (!authenticated) {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-orange-600 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-orange-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                <path d="M12 14c.83 0 1.5-.67 1.5-1.5S12.83 11 12 11s-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"/>
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-white">FanVest Protocol</h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Connect your wallet and Spotify account to discover and support
            artists through decentralized crowdfunding
          </p>
        </div>

        {/* Login Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Wallet Login Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Connect Wallet
              </h2>
              <p className="text-gray-600 mb-6">
                Connect your crypto wallet to access the decentralized features
                of FanVest Protocol
              </p>

              {authenticated ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">Wallet Connected</span>
                    </div>
                    <p className="text-sm mt-1">
                      Address: {formatAddressForDisplay(user?.wallet?.address)}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleWalletLogin}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
          <SpotifyOAuth />
        </div>

        {/* Status Message */}
        {authenticated && isConnected && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">
                Both accounts connected! Redirecting...
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-white/70 text-sm">
            By connecting your accounts, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
