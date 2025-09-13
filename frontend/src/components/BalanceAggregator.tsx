'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartAccount } from '../hooks/useSmartAccount';
import { TransactionTest } from './TransactionTest';

export function BalanceAggregator() {
  const { login, logout, authenticated, user } = usePrivy();
  const {
    smartAccountAddress,
    kernelAccount,
    kernelClient,
    isLoading,
    error,
    createSmartAccount,
    createKernelClient,
    doTest,
    testSendTransaction,
    isConnected,
    userAddress,
  } = useSmartAccount();

  const [swapParams, setSwapParams] = useState({
    fromToken: '0x0000000000000000000000000000000000000000', // ETH
    toToken: '0x0000000000000000000000000000000000000000', // ETH
    fromAmount: '1000000000000000', // 0.001 ETH
    fromChain: 1, // Ethereum
    toChain: 42161, // Arbitrum
  });

  console.log('user', user);

  const handleSwap = async () => {
    if (!smartAccountAddress) {
      await createSmartAccount();
      return;
    }

    const result = await doTest(swapParams);
    if (result) {
      console.log('Swap executed:', result);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Balance Aggregator
            </h1>
            <p className="text-gray-600 mb-8">
              Connect your wallet to start aggregating balances and swapping
              tokens
            </p>

            <button
              onClick={login}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Connect Wallet
            </button>

            <div className="mt-6 text-sm text-gray-500">
              <p>Supports:</p>
              <div className="flex justify-center space-x-4 mt-2">
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  MetaMask
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  Email
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  Google
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Balance Aggregator
              </h1>
              <p className="text-gray-600 mt-1">
                Smart wallet powered by ZeroDev & Pimlico
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Connected as</p>
                <p className="font-mono text-sm">
                  {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
                </p>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Smart Account Status */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Smart Account Status
          </h2>

          {!kernelClient ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Create Kernel Smart Wallet
              </h3>
              <p className="text-gray-600 mb-6">
                Create a Kernel smart wallet with ZeroDev for gasless
                transactions
              </p>
              <button
                onClick={createSmartAccount}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create Kernel Wallet'}
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-green-900">
                    Kernel Smart Wallet Active
                  </h3>
                  <p className="text-green-700 font-mono text-sm">
                    {smartAccountAddress}
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    Powered by Kernel + ZeroDev + Privy
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Swap Interface */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cross-Chain Swap
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Chain
              </label>
              <select
                value={swapParams.fromChain}
                onChange={(e) =>
                  setSwapParams((prev) => ({
                    ...prev,
                    fromChain: Number(e.target.value),
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>Ethereum</option>
                <option value={8453}>Base</option>
                <option value={42161}>Arbitrum</option>
                <option value={10}>Optimism</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Chain
              </label>
              <select
                value={swapParams.toChain}
                onChange={(e) =>
                  setSwapParams((prev) => ({
                    ...prev,
                    toChain: Number(e.target.value),
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>Ethereum</option>
                <option value={8453}>Base</option>
                <option value={42161}>Arbitrum</option>
                <option value={10}>Optimism</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                value={parseInt(swapParams.fromAmount) / 1e18}
                onChange={(e) =>
                  setSwapParams((prev) => ({
                    ...prev,
                    fromAmount: (parseFloat(e.target.value) * 1e18).toString(),
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.001"
              />
            </div>

            <div className="flex items-end space-x-4">
              <button
                onClick={testSendTransaction}
                disabled={!kernelClient || isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Testing...' : 'Test Transaction'}
              </button>
              <button
                onClick={handleSwap}
                disabled={!kernelClient || isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Processing...' : 'Execute Swap'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Test */}
        <div className="mt-6">
          <TransactionTest />
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Gasless Transactions
            </h3>
            <p className="text-sm text-gray-600">
              Pay gas fees with ERC-20 tokens
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Cross-Chain Swaps
            </h3>
            <p className="text-sm text-gray-600">
              Swap tokens across different chains
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Smart Account</h3>
            <p className="text-sm text-gray-600">
              Advanced account abstraction features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
