'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartAccount } from '../hooks/useSmartAccount';

export function TransactionTest() {
  const { user, authenticated } = usePrivy();
  const { kernelClient, testSendTransaction } = useSmartAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testSimpleTransaction = async () => {
    if (!kernelClient) {
      setError(
        'Kernel client not available. Please create smart account first.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing simple transaction with Kernel client...');
      console.log('User wallet address:', user?.wallet?.address);
      console.log('Kernel client:', kernelClient);

      // Use the test function from the hook
      const testResult = await testSendTransaction();

      if (testResult?.success) {
        setResult(`Transaction successful! Hash: ${testResult.txHash}`);
      } else {
        setError('Transaction test failed');
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Please connect your wallet first</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Transaction Test
      </h3>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Wallet Address:{' '}
            <span className="font-mono text-xs">{user?.wallet?.address}</span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Kernel Client Available: {kernelClient ? '✅ Yes' : '❌ No'}
          </p>
        </div>

        <button
          onClick={testSimpleTransaction}
          disabled={isLoading || !kernelClient}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isLoading ? 'Testing...' : 'Test Kernel Transaction'}
        </button>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">{result}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
