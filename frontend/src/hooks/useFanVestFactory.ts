import { useState, useEffect } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import FanVestFactoryABI from '../artifacts/FanVestFactory.sol/FanVestFactory.json';
import { CONTRACT_ADDRESSES, RPC_URLS } from '../config/contracts';

// Create a public client for read operations
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URLS.SEPOLIA),
});

export interface PoolInfo {
  poolAddress: string;
  exists: boolean;
}

export function useFanVestFactory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if a pool exists for a specific artist
   * @param artistId - The Spotify artist ID
   * @returns Promise<boolean> - True if pool exists, false otherwise
   */
  const hasPool = async (artistId: string): Promise<boolean> => {
    if (!artistId || artistId.trim() === '') {
      throw new Error('Artist ID cannot be empty');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.FANVEST_FACTORY as `0x${string}`,
        abi: FanVestFactoryABI.abi,
        functionName: 'hasPool',
        args: [artistId],
      });

      return result as boolean;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check if pool exists';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get pool information for a specific artist
   * @param artistId - The Spotify artist ID
   * @returns Promise<PoolInfo> - Pool address and existence status
   */
  const getPoolInfo = async (artistId: string): Promise<PoolInfo> => {
    if (!artistId || artistId.trim() === '') {
      throw new Error('Artist ID cannot be empty');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.FANVEST_FACTORY as `0x${string}`,
        abi: FanVestFactoryABI.abi,
        functionName: 'getPoolInfo',
        args: [artistId],
      });
      console.log(result)

      const [poolAddress, exists] = result as [string, boolean];
      
      return {
        poolAddress,
        exists,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get pool info';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get the pool address for a specific artist
   * @param artistId - The Spotify artist ID
   * @returns Promise<string> - The pool address or zero address if not found
   */
  const getPoolAddress = async (artistId: string): Promise<string> => {
    if (!artistId || artistId.trim() === '') {
      throw new Error('Artist ID cannot be empty');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.FANVEST_FACTORY as `0x${string}`,
        abi: FanVestFactoryABI.abi,
        functionName: 'getPoolAddress',
        args: [artistId],
      });

      return result as string;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get pool address';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get the total number of pools created
   * @returns Promise<number> - The number of pools created
   */
  const getPoolCount = async (): Promise<number> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.FANVEST_FACTORY as `0x${string}`,
        abi: FanVestFactoryABI.abi,
        functionName: 'getPoolCount',
      });

      return Number(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get pool count';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get all pool addresses
   * @returns Promise<string[]> - Array of all pool addresses
   */
  const getAllPools = async (): Promise<string[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.FANVEST_FACTORY as `0x${string}`,
        abi: FanVestFactoryABI.abi,
        functionName: 'getAllPools',
      });

      return result as string[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get all pools';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasPool,
    getPoolInfo,
    getPoolAddress,
    getPoolCount,
    getAllPools,
    isLoading,
    error,
  };
}
