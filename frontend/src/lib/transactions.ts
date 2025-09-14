import { encodeFunctionData, createPublicClient, http, decodeFunctionData } from 'viem';
import { sepolia } from 'viem/chains';
import { useSendTransaction } from '@privy-io/react-auth';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import FanVestPoolABI from '../artifacts/FanVestPool.sol/FanVestPool.json';
// Use the same ABI as the backend script
const usdcAbi = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];
import { aaveToWei } from './currency';

export interface FundingTransactionParams {
  poolAddress: string;
  fundAmount: string;
  sendTransaction: ReturnType<typeof useSendTransaction>['sendTransaction'];
}

export interface FundingTransactionResult {
  approveTx: string;
  depositTx: string;
}

export interface ClaimTransactionParams {
  poolAddress: string;
  sendTransaction: ReturnType<typeof useSendTransaction>['sendTransaction'];
}

export interface ClaimTransactionResult {
  claimTx: string;
}

// Helper function to decode and display transaction data
function decodeTransactionData(data: string, abi: any[], functionName: string) {
  try {
    const decoded = decodeFunctionData({
      abi,
      data: data as `0x${string}`,
    });
    console.log(`Decoded ${functionName} data:`, {
      functionName: decoded.functionName,
      args: decoded.args,
    });
  } catch (error) {
    console.log(`Could not decode ${functionName} data:`, error);
  }
}

export const executeFundingTransaction = async ({
  poolAddress,
  fundAmount,
  sendTransaction,
}: FundingTransactionParams): Promise<FundingTransactionResult> => {
  if (!poolAddress) {
    throw new Error('Pool address is required');
  }

  const amount = parseFloat(fundAmount);
  if (amount <= 0) {
    throw new Error('Please enter a valid amount to fund');
  }

  // Convert deposit token amount to wei (18 decimals)
  const depositAmount = aaveToWei(amount);
  

  // Create a public client for transaction confirmation
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org'),
  });

  
  const approveTx = await sendTransaction({
    to: CONTRACT_ADDRESSES.DEPOSIT_TOKEN as `0x${string}`,
    data: encodeFunctionData({
      abi: usdcAbi,
      functionName: 'approve',
      args: [poolAddress, depositAmount],
    }),
    gasLimit: 100000n, // Set a reasonable gas limit for approve
  });

  console.log('Approval transaction hash:', approveTx);

  // Wait for approval transaction to be included in a block
  console.log('\n=== WAITING FOR APPROVAL CONFIRMATION ===');
  console.log('Waiting for approval transaction to be confirmed...');
  try {
    const approvalReceipt = await publicClient.waitForTransactionReceipt({
      hash: approveTx.transactionHash as `0x${string}`,
      timeout: 120000, // 2 minutes timeout
    });

    // console.log('Approval receipt:', JSON.stringify(approvalReceipt, null, 2));
    console.log('Approval status:', approvalReceipt.status);
    console.log('Approval block number:', approvalReceipt.blockNumber);
    console.log('Approval gas used:', approvalReceipt.gasUsed.toString());

    if (approvalReceipt.status !== 'success') {
      throw new Error('Approval transaction failed');
    }

    console.log('✅ Approval transaction confirmed in block:', approvalReceipt.blockNumber);
  } catch (error) {
    console.error('❌ Error waiting for approval transaction:', error);
    throw new Error('Approval transaction failed or timed out');
  }

  // Step 2: Deposit to the pool (only after approval is confirmed)
  console.log('\n=== STEP 2: POOL DEPOSIT ===');
  console.log('To (Pool Contract):', poolAddress);
  console.log('Function: deposit');
  console.log('Args: [depositAmount]');
  console.log('Deposit Amount (wei):', depositAmount.toString());
  console.log('Gas Limit: 200000');
  
  const depositTx = await sendTransaction({
    to: poolAddress as `0x${string}`,
    data: encodeFunctionData({
      abi: FanVestPoolABI.abi,
      functionName: 'deposit',
      args: [depositAmount],
    }),
    gasLimit: 500000n, // Set a reasonable gas limit for deposit
  });

  console.log('Deposit transaction hash:', depositTx);
  // console.log('Deposit transaction object:', JSON.stringify(depositTx, null, 2));
  
  // Decode the deposit transaction data
  const depositData = encodeFunctionData({
    abi: FanVestPoolABI.abi,
    functionName: 'deposit',
    args: [depositAmount],
  });
  console.log('Deposit transaction data (hex):', depositData);
  decodeTransactionData(depositData, FanVestPoolABI.abi, 'deposit');

  return {
    approveTx: approveTx.transactionHash as `0x${string}`,
    depositTx: depositTx.transactionHash as `0x${string}`,
  };
};

export const executeClaimTransaction = async ({
  poolAddress,
  sendTransaction,
}: ClaimTransactionParams): Promise<ClaimTransactionResult> => {
  if (!poolAddress) {
    throw new Error('Pool address is required');
  }

  // Create a public client for transaction confirmation
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org'),
  });

  console.log('\n=== EXECUTING CLAIM TRANSACTION ===');
  console.log('Pool Address:', poolAddress);
  console.log('Function: claim');
  console.log('Args: []');
  console.log('Gas Limit: 500000');
  
  const claimTx = await sendTransaction({
    to: poolAddress as `0x${string}`,
    data: encodeFunctionData({
      abi: FanVestPoolABI.abi,
      functionName: 'claim',
      args: [],
    }),
    gasLimit: 500000n, // Set a reasonable gas limit for claim
  });

  console.log('Claim transaction hash:', claimTx);
  
  // Decode the claim transaction data
  const claimData = encodeFunctionData({
    abi: FanVestPoolABI.abi,
    functionName: 'claim',
    args: [],
  });
  console.log('Claim transaction data (hex):', claimData);
  decodeTransactionData(claimData, FanVestPoolABI.abi, 'claim');

  console.log('\n=== WAITING FOR CLAIM CONFIRMATION ===');
  console.log('Waiting for claim transaction to be confirmed...');
  
  try {
    const claimReceipt = await publicClient.waitForTransactionReceipt({
      hash: claimTx.transactionHash as `0x${string}`,
      timeout: 120000, // 2 minutes timeout
    });

    console.log('Claim status:', claimReceipt.status);
    console.log('Claim block number:', claimReceipt.blockNumber);
    console.log('Claim gas used:', claimReceipt.gasUsed.toString());

    if (claimReceipt.status !== 'success') {
      throw new Error('Claim transaction failed');
    }

    console.log('✅ Claim transaction confirmed in block:', claimReceipt.blockNumber);
  } catch (error) {
    console.error('❌ Error waiting for claim transaction:', error);
    throw new Error('Claim transaction failed or timed out');
  }

  console.log('\n=== CLAIM TRANSACTION COMPLETED ===');
  console.log('Pool Address:', poolAddress);
  console.log('Transaction Hash:', claimTx.transactionHash);
  console.log('=====================================');

  return {
    claimTx: claimTx.transactionHash as `0x${string}`,
  };
};
