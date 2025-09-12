import "dotenv/config";
import { readContract } from "viem/actions";
import { getArtifact } from "../modules/pathResolver.js";
import { poolArgs } from "../test/mockdata.js";
import { getPublicClient } from "../modules/clients.js";

const { FAN_VEST_FACTORY_ADDRESS } = process.env;

async function checkFunctionSignature() {
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

  // Check the ABI for investPooledFunds function
  const investFunction = poolArtifact.abi.find(
    (item: any) =>
      item.name === "investPooledFunds" && item.type === "function",
  );

  if (investFunction) {
    console.log("investPooledFunds function signature:");
    console.log("  Name:", investFunction.name);
    console.log("  Inputs:", investFunction.inputs);
    console.log("  Number of inputs:", investFunction.inputs.length);
    console.log(
      "  Input types:",
      investFunction.inputs.map((input: any) => input.type),
    );
  } else {
    console.log("❌ investPooledFunds function not found in ABI");
  }

  // Try to call with old signature (no parameters)
  try {
    console.log("\nTrying old signature (no parameters)...");
    const result = await readContract(publicClient, {
      address: poolAddress as `0x${string}`,
      abi: [
        {
          inputs: [],
          name: "investPooledFunds",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      functionName: "investPooledFunds",
    });
    console.log("✅ Old signature works (view function)");
  } catch (error) {
    console.log("❌ Old signature failed:", error.message);
  }

  // Try to call with new signature (4 parameters)
  try {
    console.log("\nTrying new signature (4 parameters)...");
    const result = await readContract(publicClient, {
      address: poolAddress as `0x${string}`,
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "tempAavePoolAddress",
              type: "address",
            },
            { internalType: "address", name: "coinAddress", type: "address" },
            { internalType: "uint256", name: "coinAmount", type: "uint256" },
            { internalType: "address", name: "senderAddress", type: "address" },
          ],
          name: "investPooledFunds",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      functionName: "investPooledFunds",
      args: [
        "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
        "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
        10000000n,
        poolAddress,
      ],
    });
    console.log("✅ New signature works (view function)");
  } catch (error) {
    console.log("❌ New signature failed:", error.message);
  }
}

checkFunctionSignature()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
