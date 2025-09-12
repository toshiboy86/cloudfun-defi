import "dotenv/config";

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { poolArgs } from "../../test/mockdata.js";
import { privateKeyToAccount } from "viem/accounts";

const { ARTIST_PRIVATE_KEY } = process.env;

export default buildModule("SepoliaDeploymentModuleV5", (m) => {
  // Step 1: Use NEW USDC token address on Sepolia network
  const depositTokenAddress = process.env
    .DEPOSIT_TOKEN_ADDRESS as `0x${string}`;
  // Aave V3 Pool address on Sepolia
  const aavePoolAddress = process.env.AAVE_POOL_ADDRESS as `0x${string}`;
  // Use a different address for aUSDC to avoid the "same address" issue
  // This will trigger the graceful error handling in the contract
  const returnedTokenAddress = process.env
    .RETURNED_TOKEN_ADDRESS as `0x${string}`;

  const artistAccount = privateKeyToAccount(
    `0x${ARTIST_PRIVATE_KEY}` as `0x${string}`,
  );

  const artistAddress = artistAccount.address as `0x${string}`;

  // Step 2: Deploy NEW FanVestFactory with NEW USDC address
  const fanVestFactory = m.contract("FanVestFactory", [
    depositTokenAddress,
    aavePoolAddress,
    returnedTokenAddress,
  ]);

  // Step 3: Create sample artist pools through the NEW factory
  // Note: FanVestPool contracts are deployed automatically when createPool is called

  m.call(fanVestFactory, "createPool", [...poolArgs, artistAddress]);

  return {
    fanVestFactory,
  };
});
