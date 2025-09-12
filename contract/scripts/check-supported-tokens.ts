import "dotenv/config";
import { readContract } from "viem/actions";
import { getPublicClient } from "../modules/clients.js";

const supportedTokens = [
  "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
  "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5",
  "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", // This is aUSDC
  "0x29f2D40B0605204364af54EC677bD022dA425d03",
  "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c",
  "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
  "0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a",
  "0x6d906e526a4e2Ca02097BA9d0caA3c382F52278E",
  "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60",
];

async function checkSupportedTokens() {
  const clients = await getPublicClient("sepolia");
  if (!clients) {
    console.log("Failed to get clients");
    return;
  }

  const { publicClient, account } = clients;

  console.log("Checking supported tokens for USDC characteristics...\n");

  for (const tokenAddress of supportedTokens) {
    try {
      // Check if it's an ERC20 token
      const name = await readContract(publicClient, {
        address: tokenAddress as `0x${string}`,
        abi: [
          {
            inputs: [],
            name: "name",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "name",
      });

      const symbol = await readContract(publicClient, {
        address: tokenAddress as `0x${string}`,
        abi: [
          {
            inputs: [],
            name: "symbol",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "symbol",
      });

      const decimals = await readContract(publicClient, {
        address: tokenAddress as `0x${string}`,
        abi: [
          {
            inputs: [],
            name: "decimals",
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "decimals",
      });

      const balance = await readContract(publicClient, {
        address: tokenAddress as `0x${string}`,
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
        args: [account.address],
      });

      console.log(`Token: ${tokenAddress}`);
      console.log(`  Name: ${name}`);
      console.log(`  Symbol: ${symbol}`);
      console.log(`  Decimals: ${decimals}`);
      console.log(`  Your Balance: ${balance.toString()}`);
      console.log(
        `  Formatted Balance: ${(Number(balance) / Math.pow(10, Number(decimals))).toFixed(6)}`,
      );
      console.log("---");

      // Check if this looks like USDC
      if (
        symbol.toLowerCase().includes("usdc") ||
        name.toLowerCase().includes("usd coin")
      ) {
        console.log(`🎯 POTENTIAL USDC TOKEN FOUND: ${symbol} (${name})`);
        console.log(`   Address: ${tokenAddress}`);
        console.log(`   Decimals: ${decimals}`);
        console.log("---");
      }
    } catch (error) {
      console.log(`❌ Token ${tokenAddress} is not a valid ERC20 token`);
      console.log("---");
    }
  }
}

checkSupportedTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
