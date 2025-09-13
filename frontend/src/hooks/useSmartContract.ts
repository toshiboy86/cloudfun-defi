import { useFanVestFactory } from './useFanVestFactory';
import { useFanVestPool } from './useFanVestPool';

/**
 * Combined hook that provides access to both FanVestFactory and FanVestPool functions
 * This is the main hook you should use for smart contract interactions
 */
export function useSmartContract() {
  const factory = useFanVestFactory();
  const pool = useFanVestPool();

  return {
    // Factory functions
    hasPool: factory.hasPool,
    getPoolInfo: factory.getPoolInfo,
    getPoolAddress: factory.getPoolAddress,
    getPoolCount: factory.getPoolCount,
    getAllPools: factory.getAllPools,
    
    // Pool functions (requires pool address)
    getPoolDetails: pool.getPoolInfo,
    getPoolUSDCBalance: pool.getPoolUSDCBalance,
    getTotalAssets: pool.getTotalAssets,
    getSpotifyArtistId: pool.getSpotifyArtistId,
    getTokenName: pool.getTokenName,
    getTokenSymbol: pool.getTokenSymbol,
    getTotalSupply: pool.getTotalSupply,
    
    // Create a pool-specific instance
    createPoolInstance: (poolAddress: string) => useFanVestPool(poolAddress),
    
    // Loading and error states
    isLoading: factory.isLoading || pool.isLoading,
    error: factory.error || pool.error,
  };
}

// Re-export individual hooks for specific use cases
export { useFanVestFactory } from './useFanVestFactory';
export { useFanVestPool } from './useFanVestPool';

// Re-export types
export type { PoolInfo } from './useFanVestFactory';
export type { PoolDetails } from './useFanVestPool';
