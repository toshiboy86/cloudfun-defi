import "dotenv/config";
import { readContract } from "viem/actions";
import { getArtifact } from "../modules/pathResolver.js";
import { poolArgs } from "../test/mockdata.js";
import { getPublicClient } from "../modules/clients.js";

const { FAN_VEST_FACTORY_ADDRESS } = process.env;

async function checkContractUSDC() {
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

  // Check what USDC address the contract is using
  const contractUSDCAddress = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "usdcToken",
  });

  console.log("Contract USDC address:", contractUSDCAddress);

  // Check USDC balance using the contract's USDC address
  const contractUSDCBalance = await readContract(publicClient, {
    address: contractUSDCAddress as `0x${string}`,
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
    args: [poolAddress as `0x${string}`],
  });

  console.log(
    "Pool balance in contract's USDC:",
    contractUSDCBalance.toString(),
  );

  // Check your balance in the contract's USDC
  const yourBalance = await readContract(publicClient, {
    address: contractUSDCAddress as `0x${string}`,
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
    args: [clients.account.address],
  });

  console.log("Your balance in contract's USDC:", yourBalance.toString());

  // Check if the contract's USDC is the same as the Aave-supported USDC
  const aaveSupportedUSDC = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";

  if (contractUSDCAddress.toLowerCase() === aaveSupportedUSDC.toLowerCase()) {
    console.log("✅ Contract USDC matches Aave-supported USDC");
  } else {
    console.log("❌ Contract USDC does NOT match Aave-supported USDC");
    console.log("Contract USDC:", contractUSDCAddress);
    console.log("Aave USDC:", aaveSupportedUSDC);
  }
}

checkContractUSDC()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
