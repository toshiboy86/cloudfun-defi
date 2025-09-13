'use client';

import React, { useState, useEffect } from 'react';
import { useSmartContract } from '../hooks/useSmartContract';

/**
 * Example component demonstrating how to use the smart contract hooks
 * This shows how to call hasPool and getPoolInfo functions
 */
export function ContractUsageExample() {
  const [artistId, setArtistId] = useState('');
  const [poolExists, setPoolExists] = useState<boolean | null>(null);
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [poolDetails, setPoolDetails] = useState<any>(null);

  const {
    hasPool,
    getPoolInfo,
    getPoolDetails,
    isLoading,
    error,
  } = useSmartContract();

  // Check if pool exists for artist
  const handleCheckPool = async () => {
    if (!artistId.trim()) return;

    try {
      const exists = await hasPool(artistId);
      setPoolExists(exists);
      
      if (exists) {
        // Get pool info from factory
        const info = await getPoolInfo(artistId);
        setPoolInfo(info);
        
        // Get detailed pool information from the pool contract
        if (info.poolAddress && info.poolAddress !== '0x0000000000000000000000000000000000000000') {
          const details = await getPoolDetails(info.poolAddress);
          setPoolDetails(details);
        }
      } else {
        setPoolInfo(null);
        setPoolDetails(null);
      }
    } catch (err) {
      console.error('Error checking pool:', err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Smart Contract RPC Calls Example</h2>
      
      {/* Input for Artist ID */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Spotify Artist ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            placeholder="Enter Spotify Artist ID (e.g., 06HL4z0CvFAxyc27GXpf02)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleCheckPool}
            disabled={isLoading || !artistId.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Checking...' : 'Check Pool'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {/* Pool Exists Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Pool Exists</h3>
          <p className="text-sm text-gray-600">
            {poolExists === null ? 'Not checked' : poolExists ? 'Yes' : 'No'}
          </p>
        </div>

        {/* Factory Pool Info */}
        {poolInfo && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Factory Pool Info</h3>
            <div className="text-sm space-y-1">
              <p><strong>Pool Address:</strong> {poolInfo.poolAddress}</p>
              <p><strong>Exists:</strong> {poolInfo.exists ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}

        {/* Pool Details */}
        {poolDetails && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Pool Details</h3>
            <div className="text-sm space-y-1">
              <p><strong>Artist ID:</strong> {poolDetails.artistId}</p>
              <p><strong>Token Name:</strong> {poolDetails.tokenName}</p>
              <p><strong>Token Symbol:</strong> {poolDetails.tokenSymbol}</p>
              <p><strong>Total USDC:</strong> {poolDetails.totalUSDCAmount.toString()}</p>
              <p><strong>Total Supply:</strong> {poolDetails.totalSupplyAmount.toString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Usage Instructions</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>1. Enter a Spotify Artist ID in the input field above</p>
          <p>2. Click "Check Pool" to call the smart contract functions:</p>
          <ul className="ml-4 space-y-1">
            <li>• <code>hasPool(artistId)</code> - Checks if a pool exists for the artist</li>
            <li>• <code>getPoolInfo(artistId)</code> - Gets pool address and existence status</li>
            <li>• <code>getPoolDetails(poolAddress)</code> - Gets detailed pool information</li>
          </ul>
          <p>3. The results will be displayed in the sections below</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Example of using the hooks programmatically (not in a component)
 */
export async function exampleProgrammaticUsage() {
  const { hasPool, getPoolInfo, getPoolDetails } = useSmartContract();
  
  const artistId = '06HL4z0CvFAxyc27GXpf02'; // Example Taylor Swift artist ID
  
  try {
    // Check if pool exists
    const exists = await hasPool(artistId);
    console.log('Pool exists:', exists);
    
    if (exists) {
      // Get pool info from factory
      const poolInfo = await getPoolInfo(artistId);
      console.log('Pool info:', poolInfo);
      
      // Get detailed pool information
      if (poolInfo.poolAddress && poolInfo.poolAddress !== '0x0000000000000000000000000000000000000000') {
        const poolDetails = await getPoolDetails(poolInfo.poolAddress);
        console.log('Pool details:', poolDetails);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
