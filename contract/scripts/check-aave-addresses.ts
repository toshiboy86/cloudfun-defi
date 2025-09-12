import "dotenv/config";
import { readContract } from "viem/actions";
import { getPublicClient } from "../modules/clients.js";

const { AAVE_POOL_ADDRESS, DEPOSIT_TOKEN_ADDRESS } = process.env;

async function checkAaveAddresses() {
  const clients = await getPublicClient("sepolia");
  if (!clients) {
    console.log("Failed to get clients");
    return;
  }

  const { publicClient } = clients;

  // Test the current pool address to see if it's actually the Aave Pool
  const poolAddress = AAVE_POOL_ADDRESS as `0x${string}`;

  try {
    // Try to call a function that should exist on the Aave Pool
    const result = await readContract(publicClient, {
      address: poolAddress as `0x${string}`,
      abi: [
        {
          inputs: [],
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
      args: [DEPOSIT_TOKEN_ADDRESS as `0x${string}`], // USDC address
    });

    console.log("✅ Pool address is valid Aave Pool");
    console.log("aTokenAddress (aUSDC):", result[8]);
  } catch (error) {
    console.log("❌ Pool address is not a valid Aave Pool");
    console.log("Error:", error.message);
  }

  // Test some common aUSDC addresses
  const possibleAUSDCAddresses = [
    DEPOSIT_TOKEN_ADDRESS as `0x${string}`,
    "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
  ];

  for (const address of possibleAUSDCAddresses) {
    try {
      const balance = await readContract(publicClient, {
        address: address as `0x${string}`,
        abi: [
          {
            inputs: [
              { internalType: "address", name: "account", type: "address" },
            ],
            name: "balanceOf",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "balanceOf",
        args: ["0x0000000000000000000000000000000000000000"],
      });
      console.log(`✅ ${address} is a valid ERC20 token (aUSDC candidate)`);
    } catch (error) {
      console.log(`❌ ${address} is not a valid ERC20 token`);
    }
  }
}

checkAaveAddresses()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
