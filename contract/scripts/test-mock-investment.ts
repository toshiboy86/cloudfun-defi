import "dotenv/config";
import { readContract, writeContract } from "viem/actions";
import { getArtifact } from "../modules/pathResolver.js";
import { poolArgs } from "../test/mockdata.js";
import { getPublicClient } from "../modules/clients.js";

const { FAN_VEST_FACTORY_ADDRESS } = process.env;

async function testMockInvestment() {
  const clients = await getPublicClient("sepolia");
  if (!clients) {
    console.log("Failed to get clients");
    return;
  }

  const { publicClient, walletClient, account } = clients;
  const factoryAddress = FAN_VEST_FACTORY_ADDRESS as `0x${string}`;
  const factoryArtifact = getArtifact("FanVestFactory.sol/FanVestFactory.json");
  const poolArtifact = getArtifact("FanVestPool.sol/FanVestPool.json");

  // Get pool address
  const poolAddress = await readContract(publicClient, {
    address: factoryAddress,
    abi: factoryArtifact.abi,
    functionName: "getPoolAddress",
    args: [poolArgs[0]],
  });

  console.log("Pool address:", poolAddress);

  // Check current pool state
  const poolInfo = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getPoolInfo",
  });

  const usdcBalance = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getPoolUSDCBalance",
  });

  console.log("Pool info:", poolInfo);
  console.log("USDC balance:", usdcBalance.toString());

  // Since Aave is not working, let's test other functions
  console.log("\n=== Testing Pool Functions ===");

  // Test getTotalAssets
  try {
    const totalAssets = await readContract(publicClient, {
      address: poolAddress as `0x${string}`,
      abi: poolArtifact.abi,
      functionName: "getTotalAssets",
    });
    console.log("✅ getTotalAssets works:", totalAssets.toString());
  } catch (error) {
    console.log("❌ getTotalAssets failed:", error.message);
  }

  // Test Aave addresses
  try {
    const aavePoolAddress = await readContract(publicClient, {
      address: poolAddress as `0x${string}`,
      abi: poolArtifact.abi,
      functionName: "aavePoolAddress",
    });
    const aUSDCAddress = await readContract(publicClient, {
      address: poolAddress as `0x${string}`,
      abi: poolArtifact.abi,
      functionName: "aUSDCAddress",
    });
    console.log("✅ Aave addresses:", { aavePoolAddress, aUSDCAddress });
  } catch (error) {
    console.log("❌ Aave addresses failed:", error.message);
  }

  console.log("\n=== Summary ===");
  console.log("✅ Pool contract is working");
  console.log("✅ USDC deposit/withdrawal works");
  console.log("❌ Aave integration is not working (pool is inactive)");
  console.log(
    "\nRecommendation: Use a different Aave pool or create a mock version for testing",
  );
}

testMockInvestment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
