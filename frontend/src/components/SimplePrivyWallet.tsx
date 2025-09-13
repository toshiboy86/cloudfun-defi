'use client';

import {
  usePrivy,
  useCreateWallet,
  useSendTransaction,
} from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { useState } from 'react';
import { useSmartAccount } from '../hooks/useSmartAccount';
import { parseEther } from 'viem';

export function SimplePrivyWallet() {
  const { user, login, logout, authenticated, sendTransaction } = usePrivy();
  const { createWallet } = useCreateWallet();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  console.log('user', user?.spotify?.subject);

  // Smart account hook
  const {
    smartAccountAddress,
    createSmartAccount,
    testSendTransaction,
    isLoading: smartAccountLoading,
    error: smartAccountError,
    swapToken,
    doTest,
  } = useSmartAccount();

  const smartWallets = useSmartWallets();

  // Find the smart wallet from linked accounts
  const smartWallet = user?.linkedAccounts.find(
    (account) => account.type === 'smart_wallet'
  );

  // Function to create a smart wallet manually
  const createSmartWallet = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating embedded wallet...');
      // Create an embedded wallet - smart wallets are automatically created for embedded wallets
      await createWallet();
      console.log('Embedded wallet created successfully');
      alert(
        'Embedded wallet created successfully! Smart wallet should be available now.'
      );
    } catch (error) {
      console.error('Error creating embedded wallet:', error);
      alert('Error creating embedded wallet: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test function for Privy smart wallet
  const handlePrivyTestTransaction = async () => {
    if (!smartWallet) {
      alert('Privy smart wallet not ready. Please create smart wallet first.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending test transaction via Privy smart wallet...');

      const txHash = await swapToken();

      // const txHash = await sendTransaction({
      //   to: '0x386Ab4CA67f7AbFd8d1095674bd6F55a4b9EE29D',
      //   chainId: 84532,
      //   from: smartWallet.address,
      //   value: 0n,
      //   data: '0x', // ETH送金のみの場合は'0x'
      // });

      console.log('Privy test transaction successful:', txHash);
      alert(`Privy test transaction successful! Hash: ${txHash}`);
    } catch (error) {
      console.error('Privy test transaction failed:', error);
      alert('Privy test transaction failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Simple Privy Wallet
        </h2>
        <button
          onClick={login}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Sign In with Privy
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Simple Privy Wallet
      </h2>

      <div className="mb-4">
        <p className="text-sm text-gray-600">User ID: {user?.id}</p>
        <p className="text-sm text-gray-600">EOA: {user?.wallet?.address}</p>
        {smartWallet && (
          <p className="text-sm text-gray-600">
            Privy Smart Wallet: {smartWallet.address}
          </p>
        )}
        {smartAccountAddress && (
          <p className="text-sm text-gray-600">
            Kernel Smart Account: {smartAccountAddress}
          </p>
        )}
        {smartAccountError && (
          <p className="text-sm text-red-600">Error: {smartAccountError}</p>
        )}
      </div>

      {/* Privy Smart Wallet Section */}
      {smartWallet ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Privy Smart Wallet</h3>

          {/* Quick Test Button */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Quick Test (0.01 ETH)</p>
            <button
              onClick={handlePrivyTestTransaction}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              {isLoading ? 'Sending...' : 'Swap Transaction'}
            </button>
          </div>

          {/* Quick Test Button */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Swap</p>
            <button
              onClick={doTest}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              {isLoading ? 'Sending...' : 'Test Tx'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-600">
          <h3 className="text-lg font-semibold mb-3">Privy Smart Wallet</h3>
          <p className="mb-4">
            No Privy smart wallet found. Click the button below to create one.
          </p>
          <button
            onClick={createSmartWallet}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            {isLoading ? 'Creating...' : 'Create Privy Smart Wallet'}
          </button>
        </div>
      )}

      <button
        onClick={logout}
        className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      >
        Sign Out
      </button>
    </div>
  );
}
