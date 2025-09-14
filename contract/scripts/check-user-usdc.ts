import "dotenv/config";
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://rpc.sepolia.org'),
});

// Check the failed transaction details
const failedTxHash = '0xeeb7e3acb3cad2ae943cf851e0ca711414c35e4efdbc28d58ee10f2fd273a95d';
const userAddress = '0x2D70D60D9783aD4D781baE268C545f062301eDc9';
const poolAddressFromTx = '0x486808aD2fC02894bfB248d5F16489d8900e1AB1';
const usdcAddress = '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a';

async function checkUserUSDC() {
  console.log('=== Transaction Analysis ===');
  console.log('Failed transaction hash:', failedTxHash);
  console.log('User address:', userAddress);
  console.log('Pool address from transaction:', poolAddressFromTx);
  console.log('USDC address:', usdcAddress);

  // Check if the pool address from transaction is valid
  const poolCode = await publicClient.getCode({ address: poolAddressFromTx });
  console.log('Pool contract exists:', poolCode !== '0x');

  // Check USDC balance and allowance
  const usdcAbi = [
    {
      inputs: [{ name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' }
      ],
      name: 'allowance',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    }
  ];

  try {
    const balance = await publicClient.readContract({
      address: usdcAddress,
      abi: usdcAbi,
      functionName: 'balanceOf',
      args: [userAddress],
    });
    
    const allowance = await publicClient.readContract({
      address: usdcAddress,
      abi: usdcAbi,
      functionName: 'allowance',
      args: [userAddress, poolAddressFromTx],
    });
    
    console.log('\n=== User USDC Status ===');
    console.log('USDC Balance:', balance.toString());
    console.log('USDC Balance (formatted):', (Number(balance) / 1e6).toFixed(6), 'USDC');
    console.log('Allowance for pool:', allowance.toString());
    console.log('Allowance (formatted):', (Number(allowance) / 1e6).toFixed(6), 'USDC');
    console.log('Deposit amount attempted: 1.000000 USDC');
    console.log('Has enough balance:', Number(balance) >= 1000000);
    console.log('Has enough allowance:', Number(allowance) >= 1000000);
  } catch (error) {
    console.error('Error checking USDC:', error.message);
  }
}

checkUserUSDC()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
