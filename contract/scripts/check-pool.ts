import "dotenv/config";

import { getPublicClient } from "../modules/clients.js";
import { depositPool } from "./actions/deposit.js";
import { claimPool } from "./actions/claim.js";

const { PRIVATE_KEY } = process.env;

// #1: 0x0F4CcF22096db35baed4F2e1f3b6D3787a4c8faB
async function main() {
  // Check if we have a private key for Sepolia
  if (!PRIVATE_KEY) {
    console.log("No PRIVATE_KEY found, using Hardhat network");

    // Hardhatのネットワークに接続
    console.log("Connecting to Hardhat network");
    // const { publicClient, walletClient, account } =
    //   await getPublicClient("local");

    // await executeWithClients(publicClient, walletClient, account, __dirname);
  } else {
    console.log("Using Sepolia network with private key");

    const clients = await getPublicClient("sepolia");

    // await executeWithClients(publicClient, walletClient, account, __dirname);
    await depositPool(clients!.publicClient, [
      clients!.walletClient,
      clients!.fan2WalletClient,
    ]);
    // await claimPool(
    //   clients!.publicClient,
    //   clients!.walletClient,
    //   clients!.artistWalletClient,
    // );
  }
}

// get arguments
// what would be the cmd line option?console.log("Arguments:", args);

// スクリプトを実行
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
