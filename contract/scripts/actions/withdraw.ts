import "dotenv/config";
import { getArtifact } from "../../modules/pathResolver.js";
import { readContract, writeContract } from "viem/actions";
import { poolArgs } from "../../test/mockdata.js";
import { ghoToWei, usdcToWei } from "../../modules/utils.js";

const {
  SEPOLIA_RPC_URL,
  PRIVATE_KEY,
  DEPOSIT_TOKEN_ADDRESS,
  FAN_VEST_FACTORY_ADDRESS,
  AAVE_POOL_ADDRESS,
} = process.env;

export async function withdrawPool(
  publicClient: any,
  walletClient: any,
  account: any,
) {
  // デプロイ済みのコントラクトアドレスを取得
  const factoryAddress = FAN_VEST_FACTORY_ADDRESS as `0x${string}`;
  console.log("Factory address:", factoryAddress);
  const factoryArtifact = getArtifact("FanVestFactory.sol/FanVestFactory.json");

  const poolArtifact = getArtifact("FanVestPool.sol/FanVestPool.json");

  const poolAddress = await readContract(publicClient, {
    address: factoryAddress,
    abi: factoryArtifact.abi,
    functionName: "getPoolAddress",
    args: [poolArgs[0]],
  });

  console.log("Pool address:", poolAddress);

  // Get the actual USDC balance from the pool
  const usdcBalance = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getPoolUSDCBalance",
  });

  console.log("Pool USDC balance:", usdcBalance.toString());

  const depositAmount = ghoToWei(1);

  const tx = await writeContract(walletClient, {
    account,
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "withdraw",
    args: [depositAmount],
    chain: walletClient.chain,
  });

  console.log("Transaction hash:", tx);

  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("Transaction confirmed in block:", receipt.blockNumber);
}
