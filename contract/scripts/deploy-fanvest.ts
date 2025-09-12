import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { hardhat } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { readContract, writeContract, getContractAddress } from 'viem/actions';
import { readFileSync } from 'fs';
import { join } from 'path';

// Mock USDC contract for testing (simplified ERC20)
const MOCK_USDC_ABI = [
  {
    "inputs": [
      {"name": "name", "type": "string"},
      {"name": "symbol", "type": "string"},
      {"name": "decimals", "type": "uint8"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const MOCK_USDC_BYTECODE = readFileSync(join(__dirname, '../artifacts/contracts/MockUSDC.sol/MockUSDC.json'), 'utf8');

async function main() {
  console.log('🚀 Starting FanVest deployment...\n');

  // Setup clients
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });

  const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
  const walletClient = createWalletClient({
    account,
    chain: hardhat,
    transport: http(),
  });

  console.log('📋 Deploying contracts...');
  console.log('Account:', account.address);
  console.log('Balance:', formatEther(await publicClient.getBalance({ address: account.address })), 'ETH\n');

  // 1. Deploy Mock USDC for testing
  console.log('1️⃣ Deploying Mock USDC...');
  const mockUSDCHash = await walletClient.deployContract({
    abi: MOCK_USDC_ABI,
    bytecode: JSON.parse(MOCK_USDC_BYTECODE).bytecode.object,
    args: ['Mock USDC', 'USDC', 6],
  });

  const mockUSDCTx = await publicClient.waitForTransactionReceipt({ hash: mockUSDCHash });
  const mockUSDCAddress = mockUSDCTx.contractAddress!;
  console.log('✅ Mock USDC deployed at:', mockUSDCAddress);

  // 2. Deploy FanVestFactory
  console.log('\n2️⃣ Deploying FanVestFactory...');
  const factoryArtifact = JSON.parse(readFileSync(join(__dirname, '../artifacts/contracts/FanVestFactory.sol/FanVestFactory.json'), 'utf8'));
  
  const factoryHash = await walletClient.deployContract({
    abi: factoryArtifact.abi,
    bytecode: factoryArtifact.bytecode.object,
    args: [mockUSDCAddress],
  });

  const factoryTx = await publicClient.waitForTransactionReceipt({ hash: factoryHash });
  const factoryAddress = factoryTx.contractAddress!;
  console.log('✅ FanVestFactory deployed at:', factoryAddress);

  // 3. Create a test pool
  console.log('\n3️⃣ Creating test artist pool...');
  const createPoolHash = await writeContract(walletClient, {
    address: factoryAddress,
    abi: factoryArtifact.abi,
    functionName: 'createPool',
    args: [
      '4iHNK0tOyZPYnBU7nGAgpQ', // Taylor Swift's Spotify ID
      'Taylor Swift Fan LP',
      'TSFAN'
    ],
  });

  await publicClient.waitForTransactionReceipt({ hash: createPoolHash });
  console.log('✅ Test pool created for Taylor Swift');

  // 4. Get pool address
  const poolAddress = await readContract(publicClient, {
    address: factoryAddress,
    abi: factoryArtifact.abi,
    functionName: 'artistPools',
    args: ['4iHNK0tOyZPYnBU7nGAgpQ'],
  });

  console.log('✅ Pool address:', poolAddress);

  // 5. Mint some USDC for testing
  console.log('\n4️⃣ Minting test USDC...');
  const mintAmount = parseEther('1000'); // 1000 USDC (with 6 decimals)
  const mintHash = await writeContract(walletClient, {
    address: mockUSDCAddress,
    abi: MOCK_USDC_ABI,
    functionName: 'mint',
    args: [account.address, mintAmount],
  });

  await publicClient.waitForTransactionReceipt({ hash: mintHash });
  console.log('✅ Minted 1000 USDC for testing');

  // 6. Test deposit functionality
  console.log('\n5️⃣ Testing deposit functionality...');
  
  // First approve the pool to spend USDC
  const approveHash = await writeContract(walletClient, {
    address: mockUSDCAddress,
    abi: MOCK_USDC_ABI,
    functionName: 'approve',
    args: [poolAddress, parseEther('100')], // Approve 100 USDC
  });

  await publicClient.waitForTransactionReceipt({ hash: approveHash });
  console.log('✅ Approved 100 USDC for pool');

  // Then deposit
  const poolArtifact = JSON.parse(readFileSync(join(__dirname, '../artifacts/contracts/FanVestPool.sol/FanVestPool.json'), 'utf8'));
  const depositAmount = parseEther('100'); // 100 USDC
  const depositHash = await writeContract(walletClient, {
    address: poolAddress,
    abi: poolArtifact.abi,
    functionName: 'deposit',
    args: [depositAmount],
  });

  await publicClient.waitForTransactionReceipt({ hash: depositHash });
  console.log('✅ Deposited 100 USDC, received 100 TSFAN tokens');

  // 7. Check balances
  console.log('\n6️⃣ Checking balances...');
  const usdcBalance = await readContract(publicClient, {
    address: mockUSDCAddress,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: [account.address],
  });

  const lpTokenBalance = await readContract(publicClient, {
    address: poolAddress,
    abi: poolArtifact.abi,
    functionName: 'balanceOf',
    args: [account.address],
  });

  const poolUSDCBalance = await readContract(publicClient, {
    address: poolAddress,
    abi: poolArtifact.abi,
    functionName: 'getPoolUSDCBalance',
  });

  console.log('💰 User USDC balance:', formatEther(usdcBalance), 'USDC');
  console.log('🎫 User LP token balance:', formatEther(lpTokenBalance), 'TSFAN');
  console.log('🏦 Pool USDC balance:', formatEther(poolUSDCBalance), 'USDC');

  console.log('\n🎉 Deployment and testing completed successfully!');
  console.log('\n📋 Summary:');
  console.log('Mock USDC:', mockUSDCAddress);
  console.log('FanVestFactory:', factoryAddress);
  console.log('Taylor Swift Pool:', poolAddress);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exitCode = 1;
});
