// Helper function to convert USDC amount to wei (6 decimals)
export function usdcToWei(amount: number): bigint {
  return BigInt(amount * 1000000); // USDC has 6 decimals
}

// Helper function to convert AAVE amount to wei (18 decimals)
export function aaveToWei(amount: number): bigint {
  return BigInt(amount * 1000000000000000000);
}

// Generic function to convert amount to wei based on decimals
export function amountToWei(amount: number, decimals: number): bigint {
  return BigInt(amount * Math.pow(10, decimals));
}
