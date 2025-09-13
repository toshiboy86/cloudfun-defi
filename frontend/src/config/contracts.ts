/**
 * Smart contract configuration
 * Update these addresses when contracts are deployed
 */

export const CONTRACT_ADDRESSES = {
  // FanVestFactory contract address
  FANVEST_FACTORY: process.env.NEXT_PUBLIC_FANVEST_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000',
  
  // USDC token address (Sepolia testnet)
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x0000000000000000000000000000000000000000',
  
  // Aave V3 Pool address (Sepolia testnet)
  AAVE_POOL: process.env.NEXT_PUBLIC_AAVE_POOL_ADDRESS || '0x0000000000000000000000000000000000000000',
  
  // Aave aUSDC token address (Sepolia testnet)
  AUSDC: process.env.NEXT_PUBLIC_AUSDC_ADDRESS || '0x0000000000000000000000000000000000000000',
} as const;

export const RPC_URLS = {
  // Sepolia testnet RPC URL
  SEPOLIA: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org',
} as const;

export const CHAIN_CONFIG = {
  // Sepolia testnet chain ID
  SEPOLIA_CHAIN_ID: 11155111,
} as const;

/**
 * Validate that all required contract addresses are set
 * Call this function to check if the configuration is complete
 */
export function validateContractConfig(): { isValid: boolean; missingAddresses: string[] } {
  const missingAddresses: string[] = [];
  
  if (CONTRACT_ADDRESSES.FANVEST_FACTORY === '0x0000000000000000000000000000000000000000') {
    missingAddresses.push('FANVEST_FACTORY');
  }
  
  if (CONTRACT_ADDRESSES.USDC === '0x0000000000000000000000000000000000000000') {
    missingAddresses.push('USDC');
  }
  
  if (CONTRACT_ADDRESSES.AAVE_POOL === '0x0000000000000000000000000000000000000000') {
    missingAddresses.push('AAVE_POOL');
  }
  
  if (CONTRACT_ADDRESSES.AUSDC === '0x0000000000000000000000000000000000000000') {
    missingAddresses.push('AUSDC');
  }
  
  return {
    isValid: missingAddresses.length === 0,
    missingAddresses,
  };
}

/**
 * Get contract address by name
 * @param contractName - The name of the contract
 * @returns The contract address
 */
export function getContractAddress(contractName: keyof typeof CONTRACT_ADDRESSES): string {
  return CONTRACT_ADDRESSES[contractName];
}
