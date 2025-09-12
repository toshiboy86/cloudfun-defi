import "dotenv/config";
import { readContract } from "viem/actions";
import { getArtifact } from "../modules/pathResolver.js";
import { poolArgs } from "../test/mockdata.js";
import { getPublicClient } from "../modules/clients.js";

const {
  FAN_VEST_FACTORY_ADDRESS,
  PRIVATE_KEY,
  ADMIN_PRIVATE_KEY,
  FAN2_PRIVATE_KEY,
} = process.env;

/**
 * Get the sum of ERC20 token balances for multiple accounts
 * @param publicClient - Viem public client
 * @param tokenAddress - ERC20 token contract address
 * @param accounts - Array of account objects with address and name
 * @returns Total token balance across all accounts
 */
async function getTokenSum(
  publicClient: any,
  tokenAddress: `0x${string}`,
  accounts: { account: `0x${string}`; name: string }[],
): Promise<bigint> {
  const erc20Abi = [
    {
      inputs: [{ name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  let totalBalance = 0n;

  for (const { account, name } of accounts) {
    try {
      const balance = await readContract(publicClient, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account],
      });
      totalBalance += BigInt(balance as string);
      console.log(
        `  ${name} (${account}): ${(Number(balance as string) / 1e18).toFixed(6)} AAVE`,
      );
    } catch (error) {
      console.log(
        `  ❌ Error getting balance for ${name} (${account}):`,
        error,
      );
    }
  }

  return totalBalance;
}

async function debugPool() {
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

  // Check pool state
  const poolInfo = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getPoolInfo",
  });

  console.log("Pool info:", poolInfo);

  // Check USDC balance
  const usdcBalance = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getPoolUSDCBalance",
  });

  console.log("AAVE balance:", usdcBalance.toString());

  // Check total assets
  const totalAssets = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getTotalAssets",
  });

  console.log("Total assets:", totalAssets.toString());

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

  console.log("Aave Pool Address:", aavePoolAddress);
  console.log("aUSDC Address:", aUSDCAddress);

  // Check if addresses are the same (this is likely the issue)
  if (aavePoolAddress === aUSDCAddress) {
    console.log("❌ ERROR: Aave Pool Address and aUSDC Address are the same!");
    console.log("This is incorrect - they should be different addresses.");
  } else {
    console.log("✅ Aave addresses are different (correct)");
  }

  // Check owner
  const owner = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "owner",
  });

  console.log("Pool owner:", owner);
  console.log("Caller address:", clients.walletClient!.account!.address);

  if (
    owner.toLowerCase() !==
    clients.walletClient!.account!.address!.toLowerCase()
  ) {
    console.log("❌ ERROR: Caller is not the owner of the pool!");
  } else {
    console.log("✅ Caller is the owner");
  }

  // Check balances of specific accounts
  console.log("\n=== Account Balances ===");

  // Convert private keys to addresses
  const { privateKeyToAccount } = await import("viem/accounts");

  const fanAccount = privateKeyToAccount(
    `0x${PRIVATE_KEY}` as `0x${string}`,
  ).address;
  const fan2Account = privateKeyToAccount(
    `0x${FAN2_PRIVATE_KEY}` as `0x${string}`,
  ).address;
  const adminAccount = privateKeyToAccount(
    `0x${ADMIN_PRIVATE_KEY}` as `0x${string}`,
  ).address;

  // Get artist account from environment variable
  const { ARTIST_PRIVATE_KEY } = process.env;
  let artistAccount = null;
  if (ARTIST_PRIVATE_KEY) {
    // Ensure the private key has 0x prefix
    const privateKey = ARTIST_PRIVATE_KEY.startsWith("0x")
      ? ARTIST_PRIVATE_KEY
      : `0x${ARTIST_PRIVATE_KEY}`;
    artistAccount = privateKeyToAccount(privateKey as `0x${string}`).address;
  }

  try {
    // Get ETH balances
    const balance1 = await publicClient.getBalance({ address: fanAccount });
    const balance2 = await publicClient.getBalance({ address: adminAccount });
    const balance3 = await publicClient.getBalance({ address: fan2Account });

    console.log(`Fan Account (${fanAccount}):`);
    console.log(
      `  ETH Balance: ${(Number(balance1) / 1e18).toFixed(6)} ETH (${balance1.toString()} wei)`,
    );

    console.log(`Fan2 Account (${fan2Account}):`);
    console.log(
      `  ETH Balance: ${(Number(balance3) / 1e18).toFixed(6)} ETH (${balance3.toString()} wei)`,
    );

    console.log(`Admin Account (${adminAccount}):`);
    console.log(
      `  ETH Balance: ${(Number(balance2) / 1e18).toFixed(6)} ETH (${balance2.toString()} wei)`,
    );

    // Get artist account balance if available
    if (artistAccount) {
      const artistBalance = await publicClient.getBalance({
        address: artistAccount,
      });
      console.log(`Artist Account (${artistAccount}):`);
      console.log(
        `  ETH Balance: ${(Number(artistBalance) / 1e18).toFixed(6)} ETH (${artistBalance.toString()} wei)`,
      );
    } else {
      console.log("Artist Account: Not available (ARTIST_PRIVATE_KEY not set)");
    }

    // Get USDC/AAVE token balances
    const usdcTokenAddress = await readContract(publicClient, {
      address: poolAddress as `0x${string}`,
      abi: poolArtifact.abi,
      functionName: "usdcToken",
    });

    console.log(`\nToken Address: ${usdcTokenAddress}`);

    // Check token balances for both accounts
    const tokenBalance1 = await readContract(publicClient, {
      address: usdcTokenAddress as `0x${string}`,
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
      args: [fanAccount],
    });

    const fan2Balance = await readContract(publicClient, {
      address: usdcTokenAddress as `0x${string}`,
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
      args: [fan2Account],
    });

    const tokenBalance2 = await readContract(publicClient, {
      address: usdcTokenAddress as `0x${string}`,
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
      args: [adminAccount],
    });

    console.log(
      `Fan Token Balance: ${(Number(tokenBalance1) / 1e18).toFixed(6)} AAVE (${tokenBalance1.toString()} wei)`,
    );
    console.log(
      `Fan2 Token Balance: ${(Number(fan2Balance) / 1e18).toFixed(6)} AAVE (${fan2Balance.toString()} wei)`,
    );
    console.log(
      `Admin Token Balance: ${(Number(tokenBalance2) / 1e18).toFixed(6)} AAVE (${tokenBalance2.toString()} wei)`,
    );

    // Get artist account token balance if available
    if (artistAccount) {
      const artistTokenBalance = await readContract(publicClient, {
        address: usdcTokenAddress as `0x${string}`,
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
        args: [artistAccount],
      });

      console.log(
        `Artist Account Token Balance: ${(Number(artistTokenBalance) / 1e18).toFixed(6)} AAVE (${artistTokenBalance.toString()} wei)`,
      );
    }

    // Get sum of tokens for fan accounts
    console.log("\n=== Fan Accounts Token Sum ===");
    const fanAccounts = [
      { account: fanAccount, name: "Fan1" },
      { account: fan2Account, name: "Fan2" },
    ];
    const fanTokenSum = await getTokenSum(
      publicClient,
      poolAddress as `0x${string}`,
      fanAccounts,
    );
    console.log(
      `Total Fan Token Balance: ${(Number(fanTokenSum) / 1e18).toFixed(6)} AAVE (${fanTokenSum.toString()} wei)`,
    );
  } catch (error) {
    console.log("❌ Error getting account balances:", error);
  }
}

debugPool()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
