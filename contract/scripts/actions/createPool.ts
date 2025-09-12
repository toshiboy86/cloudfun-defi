import "dotenv/config";
import { getArtifact } from "../../modules/pathResolver.js";
import { readContract, writeContract } from "viem/actions";
import { poolArgs } from "../../test/mockdata.js";

const {
  SEPOLIA_RPC_URL,
  PRIVATE_KEY,
  DEPOSIT_TOKEN_ADDRESS,
  FAN_VEST_FACTORY_ADDRESS,
} = process.env;

export async function executeWithClients(
  publicClient: any,
  walletClient: any,
  account: any,
) {
  // デプロイ済みのコントラクトアドレスを取得

  const factoryArtifact = getArtifact("FanVestFactory.sol/FanVestFactory.json");

  console.log("Creating pool...");
  const tx = await writeContract(walletClient, {
    account,
    address: FAN_VEST_FACTORY_ADDRESS as `0x${string}`,
    abi: factoryArtifact.abi,
    functionName: "createPool",
    args: poolArgs,
    chain: walletClient.chain,
  });

  console.log("Transaction hash:", tx);

  // Wait for transaction to be mined
  console.log("Waiting for transaction to be mined...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("Transaction confirmed in block:", receipt.blockNumber);

  // 4. Get pool address
  const poolAddress = await readContract(publicClient, {
    address: FAN_VEST_FACTORY_ADDRESS as `0x${string}`,
    abi: factoryArtifact.abi,
    functionName: "getPoolAddress",
    args: [poolArgs[0]],
  });

  const poolArtifact = getArtifact("FanVestPool.sol/FanVestPool.json");

  const poolInfo = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getPoolInfo",
    args: [],
  });

  console.log("Pool Address:", poolAddress);
  console.log("Pool Info:", poolInfo);
}
