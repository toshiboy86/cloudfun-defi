import { createPublicClient, createWalletClient, http } from 'viem';
import { writeContract } from 'viem/actions';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import FanVestPoolABI from '../artifacts/FanVestPool.sol/FanVestPool.json';
import { aaveToWei } from './currency';

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

export interface DirectFundingTransactionParams {
  poolAddress: string;
  fundAmount: string;
}

export interface DirectFundingTransactionResult {
  approveTx: string;
  depositTx: string;
}

export const executeDirectFundingTransaction = async ({
  poolAddress,
  fundAmount,
}: DirectFundingTransactionParams): Promise<DirectFundingTransactionResult> => {
  if (!poolAddress) {
    throw new Error('Pool address is required');
  }

  const amount = parseFloat(fundAmount);
  if (amount <= 0) {
    throw new Error('Please enter a valid amount to fund');
  }

  // Convert deposit token amount to wei (18 decimals)
  const depositAmount = aaveToWei(amount);
  console.log("depositAmount", depositAmount);

  // Private key for the account
  const privateKey = '0xce25deed0d198ec10ebca36062ce7319f5da3c1946080d2e4b27a349bfa12e7f' as `0x${string}`;
  
  // Create account from private key
  const account = privateKeyToAccount(privateKey);
  console.log("Account address:", account.address);

  // Create clients
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org'),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org'),
  });

  const depositAddress = CONTRACT_ADDRESSES.DEPOSIT_TOKEN as `0x${string}`;

  console.log('\n--- Processing Direct Transaction ---');
  console.log(`Account: ${account.address}`);
  console.log(`Pool Address: ${poolAddress}`);
  console.log(`Deposit Token Address: ${depositAddress}`);
  console.log(`Deposit Amount: ${depositAmount.toString()}`);

  try {
    // Step 1: Approve AAVE spending
    console.log("Approving AAVE spending...");
    const paramsApprove = {
      account,
      address: depositAddress,
      abi: usdcAbi,
      functionName: "approve",
      args: [poolAddress, depositAmount],
      chain: walletClient.chain,
    };
    
    const { abi, ...forprintApprove } = paramsApprove;
    console.log("forprintApprove", JSON.stringify(forprintApprove));
    
    const approveTx = await writeContract(walletClient, paramsApprove);
    console.log("Approval transaction hash:", approveTx);

    // Wait for approval to be mined
    const approveReceipt = await publicClient.waitForTransactionReceipt({
      hash: approveTx,
    });
    console.log("Approval confirmed in block:", approveReceipt.blockNumber);

    // Step 2: Deposit to the pool
    console.log("Depositing to pool...");
    const paramsDeposit = {
      account,
      address: poolAddress as `0x${string}`,
      abi: FanVestPoolABI.abi,
      functionName: "deposit",
      args: [depositAmount],
      chain: walletClient.chain,
    };
    
    const { abi: newabi, ...forprintDeposit } = paramsDeposit;
    console.log("forprintDeposit", {
      ...forprintDeposit,
      args: forprintDeposit.args.map(arg => arg.toString())
    });
    
    const depositTx = await writeContract(walletClient, paramsDeposit);
    console.log("Transaction hash:", depositTx);

    const depositReceipt = await publicClient.waitForTransactionReceipt({
      hash: depositTx,
    });
    console.log("Transaction confirmed in block:", depositReceipt.blockNumber);
    console.log(`✅ Direct transaction completed successfully`);

    return {
      approveTx: approveTx,
      depositTx: depositTx,
    };
  } catch (error) {
    console.error(`❌ Error in direct transaction:`, error);
    throw error;
  }
};
