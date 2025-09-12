import "dotenv/config";
import { readContract } from "viem/actions";
import { getPublicClient } from "../modules/clients.js";

const AAVE_POOL_ADDRESS = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";
const USDC_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";

async function checkAaveSupplyCap() {
  const clients = await getPublicClient("sepolia");
  if (!clients) {
    console.log("Failed to get clients");
    return;
  }

  const { publicClient } = clients;

  console.log("Checking Aave USDC supply cap...");
  console.log("Aave Pool:", AAVE_POOL_ADDRESS);
  console.log("USDC Address:", USDC_ADDRESS);

  try {
    // Get reserve data for USDC
    const reserveData = await readContract(publicClient, {
      address: AAVE_POOL_ADDRESS as `0x${string}`,
      abi: [
        {
          inputs: [{ internalType: "address", name: "asset", type: "address" }],
          name: "getReserveData",
          outputs: [
            {
              internalType: "uint256",
              name: "configuration",
              type: "uint256",
            },
            {
              internalType: "uint128",
              name: "liquidityIndex",
              type: "uint128",
            },
            {
              internalType: "uint128",
              name: "currentLiquidityRate",
              type: "uint128",
            },
            {
              internalType: "uint128",
              name: "variableBorrowIndex",
              type: "uint128",
            },
            {
              internalType: "uint128",
              name: "currentVariableBorrowRate",
              type: "uint128",
            },
            {
              internalType: "uint128",
              name: "currentStableBorrowRate",
              type: "uint128",
            },
            {
              internalType: "uint40",
              name: "lastUpdateTimestamp",
              type: "uint40",
            },
            {
              internalType: "uint16",
              name: "id",
              type: "uint16",
            },
            {
              internalType: "address",
              name: "aTokenAddress",
              type: "address",
            },
            {
              internalType: "address",
              name: "stableDebtTokenAddress",
              type: "address",
            },
            {
              internalType: "address",
              name: "variableDebtTokenAddress",
              type: "address",
            },
            {
              internalType: "address",
              name: "interestRateStrategyAddress",
              type: "address",
            },
            {
              internalType: "uint128",
              name: "accruedToTreasury",
              type: "uint128",
            },
            {
              internalType: "uint128",
              name: "unbacked",
              type: "uint128",
            },
            {
              internalType: "uint128",
              name: "isolationModeTotalDebt",
              type: "uint128",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "getReserveData",
      args: [USDC_ADDRESS as `0x${string}`],
    });

    console.log("✅ Successfully retrieved reserve data");
    console.log("Configuration:", reserveData[0].toString());
    console.log("aToken Address:", reserveData[8]);
    console.log("Current Liquidity Rate:", reserveData[2].toString());

    // Check if USDC is active (bit 0 of configuration)
    const isActive = (Number(reserveData[0]) & 1) !== 0;
    console.log("Is USDC active:", isActive);

    // Check if supply is enabled (bit 1 of configuration)
    const isSupplyEnabled = (Number(reserveData[0]) & 2) !== 0;
    console.log("Is supply enabled:", isSupplyEnabled);

    // Check if borrowing is enabled (bit 2 of configuration)
    const isBorrowingEnabled = (Number(reserveData[0]) & 4) !== 0;
    console.log("Is borrowing enabled:", isBorrowingEnabled);

    if (!isActive) {
      console.log("❌ USDC is not active in this Aave pool");
    }
    if (!isSupplyEnabled) {
      console.log("❌ Supply is disabled for USDC");
    }
  } catch (error) {
    console.log("❌ Error getting reserve data:", error.message);

    // Try to get basic pool info
    try {
      const reservesList = await readContract(publicClient, {
        address: AAVE_POOL_ADDRESS as `0x${string}`,
        abi: [
          {
            inputs: [],
            name: "getReservesList",
            outputs: [
              { internalType: "address[]", name: "", type: "address[]" },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "getReservesList",
      });

      console.log("Available reserves:", reservesList);
      const isUSDCInList = reservesList.some(
        (addr: string) => addr.toLowerCase() === USDC_ADDRESS.toLowerCase(),
      );
      console.log("Is USDC in reserves list:", isUSDCInList);
    } catch (listError) {
      console.log("❌ Error getting reserves list:", listError.message);
    }
  }
}

checkAaveSupplyCap()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
