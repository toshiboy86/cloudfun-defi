import "dotenv/config";
import { readContract } from "viem/actions";
import { getArtifact } from "../modules/pathResolver.js";
import { poolArgs } from "../test/mockdata.js";
import { getPublicClient } from "../modules/clients.js";

const { FAN_VEST_FACTORY_ADDRESS } = process.env;

async function checkAaveAddresses() {
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

  // Check Aave addresses
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

  const experimentAave = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getSampleAavePool",
    args: [aavePoolAddress as `0x${string}`],
  });

  console.log("✅ Aave Pool is connected", experimentAave);

  console.log("Aave Pool Address:", aavePoolAddress);
  console.log("aUSDC Address:", aUSDCAddress);

  // Check if addresses are the same (this is likely the issue)
  if (aavePoolAddress === aUSDCAddress) {
    console.log("❌ ERROR: Aave Pool Address and aUSDC Address are the same!");
    console.log("This is incorrect - they should be different addresses.");
  } else {
    console.log("✅ Aave addresses are different (correct)");
  }
}

checkAaveAddresses()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
