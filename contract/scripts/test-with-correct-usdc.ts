import "dotenv/config";
import { readContract, writeContract } from "viem/actions";
import { getArtifact } from "../modules/pathResolver.js";
import { poolArgs } from "../test/mockdata.js";
import { getPublicClient } from "../modules/clients.js";
import { usdcToWei } from "../modules/utils.js";

const { FAN_VEST_FACTORY_ADDRESS, AAVE_POOL_ADDRESS } = process.env;

// Use the correct USDC address that's supported by the Aave Pool
const CORRECT_USDC_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";

async function testWithCorrectUSDC() {
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
  console.log("Using correct USDC address:", CORRECT_USDC_ADDRESS);

  // Check USDC balance
  const usdcBalance = await readContract(publicClient, {
    address: CORRECT_USDC_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [account.address],
  });

  console.log("Your USDC balance:", usdcBalance.toString());

  if (usdcBalance === 0n) {
    console.log("❌ You don't have any of the correct USDC tokens!");
    console.log(
      "You need to get some USDC from the correct address:",
      CORRECT_USDC_ADDRESS,
    );
    return;
  }

  // Now try the investment with the correct USDC address
  const poolUSDCBalance = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getPoolUSDCBalance",
  });

  console.log("Pool USDC balance:", poolUSDCBalance.toString());

  if (poolUSDCBalance === 0n) {
    console.log("❌ Pool has no USDC to invest!");
    return;
  }

  // Try the investment
  try {
    const tx = await writeContract(walletClient, {
      account,
      address: poolAddress as `0x${string}`,
      abi: poolArtifact.abi,
      functionName: "investPooledFunds",
      args: [
        AAVE_POOL_ADDRESS as `0x${string}`, // tempAavePoolAddress
        CORRECT_USDC_ADDRESS as `0x${string}`, // coinAddress (correct USDC)
        poolUSDCBalance, // coinAmount (actual pool balance)
        poolAddress, // senderAddress (pool address)
      ],
    });

    console.log("✅ Investment transaction submitted:", tx);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("✅ Investment confirmed in block:", receipt.blockNumber);
  } catch (error) {
    console.error("❌ Investment failed:", error.message);
  }
}

testWithCorrectUSDC()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
