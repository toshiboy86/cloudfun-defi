import "dotenv/config";
import { readContract } from "viem/actions";
import { getPublicClient } from "../modules/clients.js";

const { DEPOSIT_TOKEN_ADDRESS } = process.env;

async function checkUSDCBalance() {
  const clients = await getPublicClient("sepolia");
  if (!clients) {
    console.log("Failed to get clients");
    return;
  }

  const { publicClient, account } = clients;

  // Check USDC balance
  const balance = await readContract(publicClient, {
    address: DEPOSIT_TOKEN_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [account.address],
  });

  console.log("Account address:", account.address);
  console.log("USDC balance:", balance.toString());
  console.log(
    "USDC balance (formatted):",
    (Number(balance) / 1e6).toFixed(6),
    "USDC",
  );

  if (balance === 0n) {
    console.log("❌ No USDC balance! You need to get some USDC first.");
    console.log(
      "You can get test USDC from a Sepolia faucet or mint some if this is a test token.",
    );
  } else {
    console.log("✅ You have USDC balance, you can proceed with deposits.");
  }
}

checkUSDCBalance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
