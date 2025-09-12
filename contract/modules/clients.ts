import { network } from "hardhat";
import { http, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat, sepolia } from "viem/chains";

const { SEPOLIA_RPC_URL, PRIVATE_KEY, ARTIST_PRIVATE_KEY, FAN2_PRIVATE_KEY } =
  process.env;

export const getPublicClient = async (env: string) => {
  if (env === "local") {
    const { viem } = await network.connect();
    // Setup clients - use Hardhat network for both
    const publicClient = createPublicClient({
      chain: hardhat,
      transport: http(),
    });

    // Create wallet client for signing transactions
    const walletClient = createWalletClient({
      chain: hardhat,
      transport: http(),
    });
    const account = (await viem.getWalletClients())[0].account;

    return { publicClient, walletClient, account };
  } else if (env === "sepolia") {
    // Setup clients for Sepolia
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(SEPOLIA_RPC_URL as `0x${string}`),
    });

    const account = privateKeyToAccount(`0x${PRIVATE_KEY}` as `0x${string}`);
    const fan2Account = privateKeyToAccount(
      `0x${FAN2_PRIVATE_KEY}` as `0x${string}`,
    );

    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(SEPOLIA_RPC_URL as `0x${string}`),
    });

    const fan2WalletClient = createWalletClient({
      account: fan2Account,
      chain: sepolia,
      transport: http(SEPOLIA_RPC_URL as `0x${string}`),
    });

    const artistAccount = privateKeyToAccount(
      `0x${ARTIST_PRIVATE_KEY}` as `0x${string}`,
    );

    const artistWalletClient = createWalletClient({
      account: artistAccount,
      chain: sepolia,
      transport: http(SEPOLIA_RPC_URL as `0x${string}`),
    });
    return {
      publicClient,
      walletClient,
      artistWalletClient,
      fan2WalletClient,
    };
  }
};
