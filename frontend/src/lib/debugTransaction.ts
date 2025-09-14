import { decodeFunctionData } from 'viem';
import FanVestFactoryABI from '../artifacts/FanVestFactory.sol/FanVestFactory.json';

/**
 * Debug function to decode failed transaction data
 * @param transactionData - The transaction data hex string
 */
export function debugTransaction(transactionData: string) {
  try {
    const decoded = decodeFunctionData({
      abi: FanVestFactoryABI.abi,
      data: transactionData as `0x${string}`,
    });
    
    console.log('=== TRANSACTION DEBUG ===');
    console.log('Function Name:', decoded.functionName);
    console.log('Arguments:', decoded.args);
    
    if (decoded.functionName === 'createPool') {
      const [artistId, tokenName, tokenSymbol, owner] = decoded.args as [string, string, string, string];
      console.log('Artist ID:', artistId);
      console.log('Token Name:', tokenName);
      console.log('Token Symbol:', tokenSymbol);
      console.log('Owner:', owner);
      
      // Check for potential issues
      if (!artistId || artistId === '') {
        console.error('❌ Artist ID is empty');
      }
      if (!tokenName || tokenName === '') {
        console.error('❌ Token Name is empty');
      }
      if (!tokenSymbol || tokenSymbol === '') {
        console.error('❌ Token Symbol is empty');
      }
      if (!owner || owner === '0x0000000000000000000000000000000000000000') {
        console.error('❌ Owner is zero address');
      }
    }
    
    console.log('========================');
  } catch (error) {
    console.error('Failed to decode transaction data:', error);
  }
}

/**
 * Debug the specific failed transaction from the error
 */
export function debugFailedTransaction() {
  const failedTransactionData = "0x67123c2d000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000f45ec39d19c365a74f559a00b9eda19e9e570ba30000000000000000000000000000000000000000000000000000000000000016336f44627669696976525768587749453868786b565600000000000000000000000000000000000000000000000000000000000000000000000000000000001554686520426561636820426f79732046616e204c500000000000000000000000000000000000000000000000000000000000000000000000000000000000000654484546414e0000000000000000000000000000000000000000000000000000";
  
  console.log('=== DEBUGGING FAILED TRANSACTION ===');
  console.log('Transaction Hash: 0xd9e3f0611858a712d62ad3f178529aa3934040a457dbebeb1eccc75ca0250069');
  console.log('Contract Address: 0x75d6f43D63612a0e7f4E42798554e8D4177E9412');
  console.log('Status: FAILED (0)');
  console.log('');
  
  debugTransaction(failedTransactionData);
}
