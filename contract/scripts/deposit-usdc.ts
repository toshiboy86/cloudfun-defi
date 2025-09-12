import "dotenv/config";
import { readContract, writeContract } from "viem/actions";
import { getArtifact } from "../modules/pathResolver.js";
import { poolArgs } from "../test/mockdata.js";
import { getPublicClient } from "../modules/clients.js";
import { usdcToWei } from "../modules/utils.js";

const { FAN_VEST_FACTORY_ADDRESS, DEPOSIT_TOKEN_ADDRESS } = process.env;

async function depositUSDC() {
  const clients = await getPublicClient("sepolia");
  if (!clients) {
    console.log("Failed to get clients");
    return;
  }

  const { publicClient, walletClient, account } = clients;
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

  // First, approve USDC spending
  const depositAmount = usdcToWei("10"); // Deposit 10 USDC (you have 13 USDC)
  console.log("Depositing amount:", depositAmount.toString());

  // Approve USDC spending
  const approveTx = await writeContract(walletClient, {
    account,
    address: DEPOSIT_TOKEN_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "approve",
    args: [poolAddress as `0x${string}`, depositAmount],
  });

  console.log("USDC approval transaction:", approveTx);
  await publicClient.waitForTransactionReceipt({ hash: approveTx });

  // Now deposit to the pool
  const depositTx = await writeContract(walletClient, {
    account,
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "deposit",
    args: [depositAmount],
  });

  console.log("Deposit transaction:", depositTx);
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: depositTx,
  });
  console.log("Deposit confirmed in block:", receipt.blockNumber);

  // Check new pool balance
  const newBalance = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getPoolUSDCBalance",
  });

  console.log("New pool USDC balance:", newBalance.toString());
}

depositUSDC()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
