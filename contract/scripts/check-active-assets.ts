import "dotenv/config";
import { readContract } from "viem/actions";
import { getPublicClient } from "../modules/clients.js";

const AAVE_POOL_ADDRESS = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";

const supportedTokens = [
  { address: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357", name: "DAI" },
  { address: "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5", name: "LINK" },
  { address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", name: "USDC" },
  { address: "0x29f2D40B0605204364af54EC677bD022dA425d03", name: "WBTC" },
  { address: "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c", name: "WETH" },
  { address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", name: "USDT" },
  { address: "0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a", name: "AAVE" },
  { address: "0x6d906e526a4e2Ca02097BA9d0caA3c382F52278E", name: "EURS" },
  { address: "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60", name: "GHO" },
];

async function checkActiveAssets() {
  const clients = await getPublicClient("sepolia");
  if (!clients) {
    console.log("Failed to get clients");
    return;
  }

  const { publicClient } = clients;

  console.log("Checking which assets are active in Aave pool...\n");

  for (const token of supportedTokens) {
    try {
      const reserveData = await readContract(publicClient, {
        address: AAVE_POOL_ADDRESS as `0x${string}`,
        abi: [
          {
            inputs: [
              { internalType: "address", name: "asset", type: "address" },
            ],
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
              { internalType: "uint16", name: "id", type: "uint16" },
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
              { internalType: "uint128", name: "unbacked", type: "uint128" },
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
        args: [token.address as `0x${string}`],
      });

      const configuration = Number(reserveData[0]);
      const isActive = (configuration & 1) !== 0;
      const isSupplyEnabled = (configuration & 2) !== 0;
      const isBorrowingEnabled = (configuration & 4) !== 0;

      // Try to get supply cap using a different approach
      let supplyCap = 0;
      let currentSupply = 0;
      let supplyCapReached = false;
      let supplyUtilization = 0;

      try {
        // Try getReserveConfigurationData first
        const additionalData = await readContract(publicClient, {
          address: AAVE_POOL_ADDRESS as `0x${string}`,
          abi: [
            {
              inputs: [
                { internalType: "address", name: "asset", type: "address" },
              ],
              name: "getReserveConfigurationData",
              outputs: [
                { internalType: "uint256", name: "decimals", type: "uint256" },
                { internalType: "uint256", name: "ltv", type: "uint256" },
                {
                  internalType: "uint256",
                  name: "liquidationThreshold",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "liquidationBonus",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "reserveFactor",
                  type: "uint256",
                },
                {
                  internalType: "bool",
                  name: "usageAsCollateralEnabled",
                  type: "bool",
                },
                {
                  internalType: "bool",
                  name: "borrowingEnabled",
                  type: "bool",
                },
                {
                  internalType: "bool",
                  name: "stableBorrowRateEnabled",
                  type: "bool",
                },
                { internalType: "bool", name: "isActive", type: "bool" },
                { internalType: "bool", name: "isFrozen", type: "bool" },
                { internalType: "uint256", name: "supplyCap", type: "uint256" },
                { internalType: "uint256", name: "borrowCap", type: "uint256" },
                {
                  internalType: "uint256",
                  name: "debtCeiling",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "liquidationProtocolFee",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "eModeCategory",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "unbackedMintCap",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "maxStableRateBorrowSizePercent",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "borrowableInIsolation",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "getReserveConfigurationData",
          args: [token.address as `0x${string}`],
        });
        supplyCap = Number(additionalData[10]); // supplyCap
      } catch (error) {
        console.log(`  ⚠️  Could not get supply cap data: ${error.message}`);
        supplyCap = 0; // Assume no cap if we can't get the data
      }

      // Get current supply amount
      try {
        const aTokenAddress = reserveData[8];
        const aTokenBalance = await readContract(publicClient, {
          address: aTokenAddress as `0x${string}`,
          abi: [
            {
              inputs: [],
              name: "totalSupply",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "totalSupply",
        });
        currentSupply = Number(aTokenBalance);
      } catch (error) {
        console.log(
          `  ⚠️  Could not get current supply data: ${error.message}`,
        );
        currentSupply = 0;
      }

      supplyCapReached = supplyCap > 0 && currentSupply >= supplyCap;
      supplyUtilization = supplyCap > 0 ? (currentSupply / supplyCap) * 100 : 0;

      console.log(`${token.name} (${token.address}):`);
      console.log(`  Active: ${isActive ? "✅" : "❌"}`);
      console.log(`  Supply Enabled: ${isSupplyEnabled ? "✅" : "❌"}`);
      console.log(`  Borrowing Enabled: ${isBorrowingEnabled ? "✅" : "❌"}`);
      console.log(
        `  Supply Cap: ${supplyCap === 0 ? "No Cap" : supplyCap.toLocaleString()}`,
      );
      console.log(`  Current Supply: ${currentSupply.toLocaleString()}`);
      console.log(
        `  Supply Utilization: ${supplyCap > 0 ? supplyUtilization.toFixed(2) + "%" : "N/A"}`,
      );
      console.log(`  Cap Reached: ${supplyCapReached ? "❌ YES" : "✅ NO"}`);
      console.log(`  aToken: ${reserveData[8]}`);

      if (isActive && isSupplyEnabled && !supplyCapReached) {
        console.log(
          `  🎯 RECOMMENDED: ${token.name} is active, supply enabled, and cap not reached!`,
        );
      } else if (supplyCapReached) {
        console.log(
          `  ⚠️  WARNING: ${token.name} supply cap has been reached!`,
        );
      }
      console.log("---");
    } catch (error) {
      console.log(`${token.name}: ❌ Error - ${error.message}`);
      console.log("---");
    }
  }
}

checkActiveAssets()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
