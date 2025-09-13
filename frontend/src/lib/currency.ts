// Helper function to convert USDC amount to wei (6 decimals)
export function usdcToWei(amount: number): bigint {
    return BigInt(amount * 1000000); // USDC has 6 decimals
  }
  
  // Helper function to convert GHO amount to wei (18 decimals)
  export function ghoToWei(amount: number): bigint {
    return BigInt(amount * 1000000000000000000); // GHO has 18 decimals
  }


  // Helper function to convert USDC wei to USDC amount (6 decimals)
  export function weiToUsdc(amount: bigint): number {
    return Number(amount) / 1000000000000000000; // USDC has 6 decimals
  }
  
  // Generic function to convert amount to wei based on decimals
  export function amountToWei(amount: number, decimals: number): bigint {
    return BigInt(amount * Math.pow(10, decimals));
  }
  