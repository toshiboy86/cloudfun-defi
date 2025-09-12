import "dotenv/config";
import { readContract } from "viem/actions";
import { getArtifact } from "../modules/pathResolver.js";
import { poolArgs } from "../test/mockdata.js";
import { getPublicClient } from "../modules/clients.js";

const { FAN_VEST_FACTORY_ADDRESS } = process.env;

async function debugClaim() {
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

  // Check all relevant values
  const totalAssets = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getTotalAssets",
  });

  const totalUSDC = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "totalUSDC",
  });

  const liquidUSDC = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getPoolUSDCBalance",
  });

  const aUSDCAddress = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "aUSDCAddress",
  });

  console.log("totalAssets:", totalAssets.toString());
  console.log("totalUSDC:", totalUSDC.toString());
  console.log("liquidUSDC:", liquidUSDC.toString());
  console.log("aUSDCAddress:", aUSDCAddress);

  // Check aUSDC balance
  try {
    const aUSDCBalance = await readContract(publicClient, {
      address: aUSDCAddress as `0x${string}`,
      abi: [
        {
          inputs: [{ name: "account", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "balanceOf",
      args: [poolAddress],
    });
    console.log("aUSDCBalance:", aUSDCBalance.toString());
  } catch (error) {
    console.log("Error getting aUSDC balance:", error);
  }

  // Calculate what would happen in claim function
  console.log("\n=== Claim Function Analysis ===");
  console.log("totalAssets >= totalUSDC?", totalAssets >= totalUSDC);

  if (totalAssets >= totalUSDC) {
    const earnedInterest = totalAssets - totalUSDC;
    console.log("earnedInterest would be:", earnedInterest.toString());
  } else {
    console.log("earnedInterest would be: 0 (underflow prevented)");
  }
}

debugClaim()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
