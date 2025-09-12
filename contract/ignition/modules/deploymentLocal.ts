import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// AAVE Pool address: 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
// USDC token address: 0x8bebfcbe5468f146533c182df3dfbf5ff9be00e2

export default buildModule("CompleteDeploymentModule", (m) => {
  // Step 1: Deploy Mock USDC first (needed for FanVestFactory)
  const mockUSDC = m.contract("MockUSDC", ["Mock USDC", "USDC", 6]);

  // Step 2: Deploy FanVestFactory with Mock USDC address
  const fanVestFactory = m.contract("FanVestFactory", [mockUSDC]);

  // Step 3: Create sample artist pools through the factory
  // Note: FanVestPool contracts are deployed automatically when createPool is called

  m.call(fanVestFactory, "createPool", [
    "3kzwYV3OCB010YfXMF0Avt", // Alvvays's Spotify ID
    "Alvvays Fan LP",
    "ALVVA",
  ]);

  return {
    mockUSDC,
    fanVestFactory,
  };
});
