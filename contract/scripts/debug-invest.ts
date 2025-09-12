import "dotenv/config";
import { readContract } from "viem/actions";
import { getArtifact } from "../modules/pathResolver.js";
import { poolArgs } from "../test/mockdata.js";
import { getPublicClient } from "../modules/clients.js";

const { FAN_VEST_FACTORY_ADDRESS, AAVE_POOL_ADDRESS, DEPOSIT_TOKEN_ADDRESS } =
  process.env;

async function debugInvest() {
  const clients = await getPublicClient("sepolia");
  if (!clients) {
    console.log("Failed to get clients");
    return;
  }

  const { publicClient } = clients;
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

  // Check pool USDC balance
  const usdcBalance = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getPoolUSDCBalance",
  });

  console.log("Pool USDC balance:", usdcBalance.toString());

  // Check if pool has any USDC
  if (usdcBalance === 0n) {
    console.log("❌ ERROR: Pool has no USDC to invest!");
    console.log("You need to deposit USDC to the pool first.");
    return;
  }

  // Check Aave pool reserves
  try {
    const reserves = await readContract(publicClient, {
      address: poolAddress as `0x${string}`,
      abi: poolArtifact.abi,
      functionName: "getSampleAavePool",
      args: [AAVE_POOL_ADDRESS as `0x${string}`],
    });
    console.log("Aave pool reserves:", reserves);
  } catch (error) {
    console.log("Error getting Aave reserves:", error.message);
  }

  // Check USDC allowance
  const usdcContract = await readContract(publicClient, {
    address: DEPOSIT_TOKEN_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "allowance",
    args: [poolAddress as `0x${string}`, AAVE_POOL_ADDRESS as `0x${string}`],
  });

  console.log("USDC allowance for Aave pool:", usdcContract.toString());

  console.log("\n=== Correct function call parameters should be: ===");
  console.log("tempAavePoolAddress:", AAVE_POOL_ADDRESS);
  console.log("coinAddress (USDC):", DEPOSIT_TOKEN_ADDRESS);
  console.log("coinAmount (should be usdcBalance):", usdcBalance.toString());
  console.log("senderAddress (should be pool address):", poolAddress);
}

debugInvest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
