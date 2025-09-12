import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('VerificationRegistry', (m) => {
  // Deploy the VerificationRegistry contract
  const verificationRegistry = m.contract('VerificationRegistry', []);

  return { verificationRegistry };
});
