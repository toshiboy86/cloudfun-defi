import "dotenv/config";
import { getArtifact } from "../../modules/pathResolver.js";
import { readContract, writeContract } from "viem/actions";
import { poolArgs } from "../../test/mockdata.js";
import { usdcAbi } from "../abi.js";
import { usdcToWei, ghoToWei } from "../../modules/utils.js";

const { DEPOSIT_TOKEN_ADDRESS, FAN_VEST_FACTORY_ADDRESS } = process.env;

export async function depositPool(publicClient: any, walletClients: any[]) {
  // デプロイ済みのコントラクトアドレスを取得
  const factoryAddress = FAN_VEST_FACTORY_ADDRESS as `0x${string}`;

  const factoryArtifact = getArtifact("FanVestFactory.sol/FanVestFactory.json");
  const poolArtifact = getArtifact("FanVestPool.sol/FanVestPool.json");

  const poolAddress = await readContract(publicClient, {
    address: factoryAddress,
    abi: factoryArtifact.abi,
    functionName: "getPoolAddress",
    args: [poolArgs[0]],
  });

  console.log("Pool address:", poolAddress);

  const depositAmount = ghoToWei(1.5); // 3 GHO (18 decimals)
  console.log("depositAmount", depositAmount);

  const depositAddress = DEPOSIT_TOKEN_ADDRESS as `0x${string}`; // GHO on Sepolia

  // Process each wallet client
  for (let i = 0; i < walletClients.length; i++) {
    const walletClient = walletClients[i];
    const account = walletClient.account;

    console.log(
      `\n--- Processing wallet ${i + 1}/${walletClients.length} (${account.address}) ---`,
    );

    try {
      // First, we need to approve the pool contract to spend GHO
      console.log("Approving GHO spending...");
      const approveTx = await writeContract(walletClient, {
        account,
        address: depositAddress as `0x${string}`,
        abi: usdcAbi,
        functionName: "approve",
        args: [poolAddress, depositAmount],
        chain: walletClient.chain,
      });

      console.log("Approval transaction hash:", approveTx);

      // Wait for approval to be mined
      const approveReceipt = await publicClient.waitForTransactionReceipt({
        hash: approveTx,
      });
      console.log("Approval confirmed in block:", approveReceipt.blockNumber);

      // Now deposit to the pool
      console.log("Depositing to pool...");
      const tx = await writeContract(walletClient, {
        account,
        address: poolAddress as `0x${string}`,
        abi: poolArtifact.abi,
        functionName: "deposit",
        args: [depositAmount],
        chain: walletClient.chain,
      });

      console.log("Transaction hash:", tx);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      console.log("Transaction confirmed in block:", receipt.blockNumber);
      console.log(`✅ Wallet ${i + 1} deposit completed successfully`);
    } catch (error) {
      console.error(`❌ Error processing wallet ${i + 1}:`, error);
      // Continue with next wallet even if one fails
    }
  }

  // Get final pool info after all deposits
  console.log("\n--- Final Pool Info ---");
  const poolInfo = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getPoolInfo",
    args: [],
  });

  console.log("Pool info:", poolInfo);
}
