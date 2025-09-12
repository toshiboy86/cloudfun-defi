import "dotenv/config";

import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
} from "viem";
import { network } from "hardhat";
import { hardhat, sepolia } from "viem/chains";
import { join } from "path";

import { readContract, writeContract } from "viem/actions";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const { SEPOLIA_RPC_URL } = process.env;

// #1: 0x0F4CcF22096db35baed4F2e1f3b6D3787a4c8faB
async function main() {
  // Get __dirname equivalent for ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Setup clients
  const publicClient = createPublicClient({
    // flor local network
    chain: sepolia,
    transport: http(SEPOLIA_RPC_URL as `0x${string}`),
    // chain: hardhat,
    // transport: http(),
  });
  // Hardhatのネットワークに接続
  console.log("Connecting to Hardhat network");
  const { viem } = await network.connect();

  // デプロイ済みのコントラクトアドレスを取得
  const factoryAddress = "0x0F4CcF22096db35baed4F2e1f3b6D3787a4c8faB";

  // コントラクトインスタンスを作成
  const factory = await viem.getContractAt("FanVestFactory", factoryAddress);

  const factoryArtifact = JSON.parse(
    readFileSync(
      join(
        __dirname,
        "../artifacts/contracts/FanVestFactory.sol/FanVestFactory.json",
      ),
      "utf8",
    ),
  );

  // 4. Get pool address
  const poolAddress = await readContract(publicClient, {
    address: factoryAddress,
    abi: factoryArtifact.abi,
    functionName: "getPoolAddress",
    args: ["4iHNK0tOyZPYnBU7nGAgpQ"],
  });

  const poolArtifact = JSON.parse(
    readFileSync(
      join(
        __dirname,
        "../artifacts/contracts/FanVestPool.sol/FanVestPool.json",
      ),
      "utf8",
    ),
  );

  const poolInfo = await readContract(publicClient, {
    address: poolAddress as `0x${string}`,
    abi: poolArtifact.abi,
    functionName: "getPoolInfo",
    args: [],
  });

  // const res = factory.read.getPoolAddress(["4iHNK0tOyZPYnBU7nGAgpQ"]);
  console.log("res", poolInfo);
  // getPoolAddress
}

// スクリプトを実行
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
