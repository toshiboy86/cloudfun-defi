/**
 * Formats a wallet address to show first 6 and last 4 characters
 * @param address - The full wallet address
 * @returns Formatted address string (e.g., "0x1234...5678")
 */
export function formatWalletAddress(address: string | undefined | null): string {
  if (!address) return 'Not Connected';
  
  if (address.length <= 10) return address;
  
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Formats a wallet address for display in UI components
 * @param address - The full wallet address
 * @param fallback - Fallback text when address is not available
 * @returns Formatted address string with fallback
 */
export function formatAddressForDisplay(
  address: string | undefined | null, 
  fallback: string = 'Not Connected'
): string {
  if (!address) return fallback;
  
  if (address.length <= 10) return address;
  
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}