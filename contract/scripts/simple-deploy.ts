import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
} from "viem";
import { hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { readContract, writeContract } from "viem/actions";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log("🚀 Starting FanVest deployment...\n");

  // Setup clients
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });

  const account = privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  );
  const walletClient = createWalletClient({
    account,
    chain: hardhat,
    transport: http(),
  });

  console.log("📋 Deploying contracts...");
  console.log("Account:", account.address);
  console.log(
    "Balance:",
    formatEther(await publicClient.getBalance({ address: account.address })),
    "ETH\n",
  );

  // 1. Deploy Mock USDC for testing
  console.log("1️⃣ Deploying Mock USDC...");
  const mockUSDCArtifact = JSON.parse(
    readFileSync(
      join(__dirname, "../artifacts/contracts/MockUSDC.sol/MockUSDC.json"),
      "utf8",
    ),
  );

  const mockUSDCHash = await walletClient.deployContract({
    abi: mockUSDCArtifact.abi,
    bytecode: mockUSDCArtifact.bytecode.object,
    args: ["Mock USDC", "USDC", 6],
  });

  const mockUSDCTx = await publicClient.waitForTransactionReceipt({
    hash: mockUSDCHash,
  });
  const mockUSDCAddress = mockUSDCTx.contractAddress!;
  console.log("✅ Mock USDC deployed at:", mockUSDCAddress);

  // 2. Deploy FanVestFactory
  console.log("\n2️⃣ Deploying FanVestFactory...");
  const factoryArtifact = JSON.parse(
    readFileSync(
      join(
        __dirname,
        "../artifacts/contracts/FanVestFactory.sol/FanVestFactory.json",
      ),
      "utf8",
    ),
  );

  const factoryHash = await walletClient.deployContract({
    abi: factoryArtifact.abi,
    bytecode: factoryArtifact.bytecode.object,
    args: [mockUSDCAddress],
  });

  const factoryTx = await publicClient.waitForTransactionReceipt({
    hash: factoryHash,
  });
  const factoryAddress = factoryTx.contractAddress!;
  console.log("✅ FanVestFactory deployed at:", factoryAddress);

  // 3. Create a test pool
  console.log("\n3️⃣ Creating test artist pool...");
  const createPoolHash = await writeContract(walletClient, {
    address: factoryAddress,
    abi: factoryArtifact.abi,
    functionName: "createPool",
    args: [
      "4iHNK0tOyZPYnBU7nGAgpQ", // Taylor Swift's Spotify ID
      "Taylor Swift Fan LP",
      "TSFAN",
    ],
  });

  await publicClient.waitForTransactionReceipt({ hash: createPoolHash });
  console.log("✅ Test pool created for Taylor Swift");

  // 4. Get pool address
  const poolAddress = await readContract(publicClient, {
    address: factoryAddress,
    abi: factoryArtifact.abi,
    functionName: "artistPools",
    args: ["4iHNK0tOyZPYnBU7nGAgpQ"],
  });

  console.log("✅ Pool address:", poolAddress);

  // 5. Mint some USDC for testing
  console.log("\n4️⃣ Minting test USDC...");
  const mintAmount = BigInt(1000 * 10 ** 6); // 1000 USDC (with 6 decimals)
  const mintHash = await writeContract(walletClient, {
    address: mockUSDCAddress,
    abi: mockUSDCArtifact.abi,
    functionName: "mint",
    args: [account.address, mintAmount],
  });

  await publicClient.waitForTransactionReceipt({ hash: mintHash });
  console.log("✅ Minted 1000 USDC for testing");

  // 6. Test deposit functionality
  console.log("\n5️⃣ Testing deposit functionality...");

  // First approve the pool to spend USDC
  const approveHash = await writeContract(walletClient, {
    address: mockUSDCAddress,
    abi: mockUSDCArtifact.abi,
    functionName: "approve",
    args: [poolAddress, BigInt(100 * 10 ** 6)], // Approve 100 USDC
  });

  await publicClient.waitForTransactionReceipt({ hash: approveHash });
  console.log("✅ Approved 100 USDC for pool");

  // Then deposit
  const poolArtifact = JSON.parse(
    readFileSync(
      join(
        __dirname,
        "../artifacts/contracts/FanVestPool.sol/FanVestPool.json",
      ),
      "utf8",
    ),
  );
  const depositAmount = BigInt(100 * 10 ** 6); // 100 USDC
  const depositHash = await writeContract(walletClient, {
    address: poolAddress,
    abi: poolArtifact.abi,
    functionName: "deposit",
    args: [depositAmount],
  });

  await publicClient.waitForTransactionReceipt({ hash: depositHash });
  console.log("✅ Deposited 100 USDC, received 100 TSFAN tokens");

  // 7. Check balances
  console.log("\n6️⃣ Checking balances...");
  const usdcBalance = await readContract(publicClient, {
    address: mockUSDCAddress,
    abi: mockUSDCArtifact.abi,
    functionName: "balanceOf",
    args: [account.address],
  });

  const lpTokenBalance = await readContract(publicClient, {
    address: poolAddress,
    abi: poolArtifact.abi,
    functionName: "balanceOf",
    args: [account.address],
  });

  const poolUSDCBalance = await readContract(publicClient, {
    address: poolAddress,
    abi: poolArtifact.abi,
    functionName: "getPoolUSDCBalance",
  });

  console.log(
    "💰 User USDC balance:",
    (Number(usdcBalance) / 10 ** 6).toFixed(2),
    "USDC",
  );
  console.log(
    "🎫 User LP token balance:",
    (Number(lpTokenBalance) / 10 ** 6).toFixed(2),
    "TSFAN",
  );
  console.log(
    "🏦 Pool USDC balance:",
    (Number(poolUSDCBalance) / 10 ** 6).toFixed(2),
    "USDC",
  );

  console.log("\n🎉 Deployment and testing completed successfully!");
  console.log("\n📋 Summary:");
  console.log("Mock USDC:", mockUSDCAddress);
  console.log("FanVestFactory:", factoryAddress);
  console.log("Taylor Swift Pool:", poolAddress);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
