import { useState, useEffect } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import FanVestPoolABI from '../artifacts/FanVestPool.sol/FanVestPool.json';
import { RPC_URLS } from '../config/contracts';

// Create a public client for read operations
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URLS.SEPOLIA),
});

export interface PoolDetails {
  artistId: string;
  tokenName: string;
  tokenSymbol: string;
  totalUSDCAmount: bigint;
  totalSupplyAmount: bigint;
}

export function useFanVestPool(poolAddress?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get comprehensive pool information
   * @param poolAddress - The pool contract address (optional if provided in hook)
   * @returns Promise<PoolDetails> - Complete pool information
   */
  const getPoolInfo = async (address?: string): Promise<PoolDetails> => {
    const targetAddress = address || poolAddress;
    
    if (!targetAddress || targetAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Pool address is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: targetAddress as `0x${string}`,
        abi: FanVestPoolABI.abi,
        functionName: 'getPoolInfo',
      });

      const [artistId, tokenName, tokenSymbol, totalUSDCAmount, totalSupplyAmount] = result as [
        string,
        string,
        string,
        bigint,
        bigint
      ];
      
      return {
        artistId,
        tokenName,
        tokenSymbol,
        totalUSDCAmount,
        totalSupplyAmount,
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
   * Get the current USDC balance of the pool
   * @param poolAddress - The pool contract address (optional if provided in hook)
   * @returns Promise<bigint> - Current USDC balance
   */
  const getPoolUSDCBalance = async (address?: string): Promise<bigint> => {
    const targetAddress = address || poolAddress;
    
    if (!targetAddress || targetAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Pool address is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: targetAddress as `0x${string}`,
        abi: FanVestPoolABI.abi,
        functionName: 'getPoolUSDCBalance',
      });

      return result as bigint;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get pool USDC balance';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculate total assets in the pool (liquid USDC + aUSDC from Aave including earning interest)
   * @param poolAddress - The pool contract address (optional if provided in hook)
   * @returns Promise<bigint> - Total value of all assets in the pool
   */
  const getTotalAssets = async (address?: string): Promise<bigint> => {
    const targetAddress = address || poolAddress;
    
    if (!targetAddress || targetAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Pool address is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: targetAddress as `0x${string}`,
        abi: FanVestPoolABI.abi,
        functionName: 'getTotalAssets',
      });

      return result as bigint;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get total assets';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get the Spotify artist ID for this pool
   * @param poolAddress - The pool contract address (optional if provided in hook)
   * @returns Promise<string> - The Spotify artist ID
   */
  const getSpotifyArtistId = async (address?: string): Promise<string> => {
    const targetAddress = address || poolAddress;
    
    if (!targetAddress || targetAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Pool address is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: targetAddress as `0x${string}`,
        abi: FanVestPoolABI.abi,
        functionName: 'spotifyArtistId',
      });

      return result as string;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get Spotify artist ID';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get the token name of the LP token
   * @param poolAddress - The pool contract address (optional if provided in hook)
   * @returns Promise<string> - The token name
   */
  const getTokenName = async (address?: string): Promise<string> => {
    const targetAddress = address || poolAddress;
    
    if (!targetAddress || targetAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Pool address is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: targetAddress as `0x${string}`,
        abi: FanVestPoolABI.abi,
        functionName: 'name',
      });

      return result as string;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get token name';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get the token symbol of the LP token
   * @param poolAddress - The pool contract address (optional if provided in hook)
   * @returns Promise<string> - The token symbol
   */
  const getTokenSymbol = async (address?: string): Promise<string> => {
    const targetAddress = address || poolAddress;
    
    if (!targetAddress || targetAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Pool address is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: targetAddress as `0x${string}`,
        abi: FanVestPoolABI.abi,
        functionName: 'symbol',
      });

      return result as string;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get token symbol';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get the total supply of LP tokens
   * @param poolAddress - The pool contract address (optional if provided in hook)
   * @returns Promise<bigint> - The total supply of LP tokens
   */
  const getTotalSupply = async (address?: string): Promise<bigint> => {
    const targetAddress = address || poolAddress;
    
    if (!targetAddress || targetAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Pool address is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: targetAddress as `0x${string}`,
        abi: FanVestPoolABI.abi,
        functionName: 'totalSupply',
      });

      return result as bigint;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get total supply';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getPoolInfo,
    getPoolUSDCBalance,
    getTotalAssets,
    getSpotifyArtistId,
    getTokenName,
    getTokenSymbol,
    getTotalSupply,
    isLoading,
    error,
  };
}
