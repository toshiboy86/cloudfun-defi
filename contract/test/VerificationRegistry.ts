import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { keccak256, toHex, encodePacked } from "viem";

import { network } from "hardhat";

describe("VerificationRegistry", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  // Test accounts
  const [attester, claimant, otherAccount] = await viem.getWalletClients();

  it("Should emit the VerificationInitiated event when calling initVerification()", async function () {
    const vr = await viem.deployContract("VerificationRegistry");

    const tx = await vr.write.initVerification([claimant.account.address], {
      account: attester.account,
    });

    const receipt = await publicClient.getTransactionReceipt({ hash: tx });
    const logs = receipt.logs.filter((log) => log.address === vr.address);

    assert.equal(logs.length, 1);
    assert.equal(
      logs[0].topics[0],
      keccak256(toHex("VerificationInitiated(address,address,uint256)")),
    );
  });

  it("Should prevent duplicate verification requests", async function () {
    const vr = await viem.deployContract("VerificationRegistry");

    // First request should succeed
    await vr.write.initVerification([claimant.account.address], {
      account: attester.account,
    });

    // Second request should fail
    await assert.rejects(async () => {
      await vr.write.initVerification([claimant.account.address], {
        account: attester.account,
      });
    }, /Already requested/);
  });

  it("Should reject zero address in initVerification", async function () {
    const vr = await viem.deployContract("VerificationRegistry");

    await assert.rejects(async () => {
      await vr.write.initVerification(
        ["0x0000000000000000000000000000000000000000"],
        {
          account: attester.account,
        },
      );
    }, /InvalidAddress/);
  });

  it("Should complete verification with valid signature", async function () {
    const vr = await viem.deployContract("VerificationRegistry");

    // Initiate verification
    await vr.write.initVerification([claimant.account.address], {
      account: attester.account,
    });

    // Get the verification request
    const request = await vr.read.requests([
      claimant.account.address,
      attester.account.address,
    ]);

    // `I confirm that I will not scam the user:${claimant.account.address}${attester.account.address}${request[2]}${request[3]}${vr.address}`,
    const messageHash = keccak256(
      encodePacked(
        ["string", "address", "address", "uint256", "uint64", "address"],
        [
          "I confirm that I will not scam the user:",
          claimant.account.address,
          attester.account.address,
          request[2],
          request[3],
          vr.address,
        ],
      ),
    );

    // // // Sign the message with claimant's private key
    const signature = await claimant.signMessage({
      message: { raw: messageHash },
    });

    // // // Complete verification
    const tx = await vr.write.completeVerification(
      [attester.account.address, signature],
      {
        account: claimant.account,
      },
    );

    const receipt = await publicClient.getTransactionReceipt({ hash: tx });

    const logs = receipt.logs.filter((log) => log.address === vr.address);

    // assert.equal(logs.length, 1);
    // assert.equal(
    //   logs[0].topics[0],
    //   keccak256(toHex("Verified(address,address,uint64)")),
    // );

    // // // Check that claimant is now verified
    const isVerified = await vr.read.isVerified([claimant.account.address]);
    assert.equal(isVerified, true);

    // // Check that request is marked as completed
    // const completedRequest = await vr.read.requests([
    //   attester.account.address,
    //   claimant.account.address,
    // ]);
    // assert.equal(completedRequest[4], true);
  });

  // it('Should reject verification completion without valid request', async function () {
  //   const vr = await viem.deployContract('VerificationRegistry');

  //   const signature = await claimant.signMessage({
  //     message: { raw: '0x1234567890abcdef' },
  //   });

  //   await assert.rejects(async () => {
  //     await vr.write.completeVerification(
  //       [claimant.account.address, signature],
  //       {
  //         account: attester.account,
  //       }
  //     );
  //   }, /No request found/);
  // });

  // it('Should reject verification completion with invalid signature', async function () {
  //   const vr = await viem.deployContract('VerificationRegistry');

  //   // Initiate verification
  //   await vr.write.initVerification([claimant.account.address], {
  //     account: attester.account,
  //   });

  //   // Sign with wrong account
  //   const signature = await otherAccount.signMessage({
  //     message: { raw: '0x1234567890abcdef' },
  //   });

  //   await assert.rejects(async () => {
  //     await vr.write.completeVerification(
  //       [claimant.account.address, signature],
  //       {
  //         account: attester.account,
  //       }
  //     );
  //   }, /Invalid signature/);
  // });

  // it('Should prevent double completion of verification', async function () {
  //   const vr = await viem.deployContract('VerificationRegistry');

  //   // Initiate verification
  //   await vr.write.initVerification([claimant.account.address], {
  //     account: attester.account,
  //   });

  //   // Get the verification request
  //   const request = await vr.read.requests([
  //     attester.account.address,
  //     claimant.account.address,
  //   ]);

  //   // Create the message hash
  //   const messageHash = keccak256(
  //     toHex(
  //       `I confirm that I will not scam the user:${claimant.account.address}${attester.account.address}${request[2]}${request[3]}${vr.address}`
  //     )
  //   );

  //   // Sign and complete verification
  //   const signature = await claimant.signMessage({
  //     message: { raw: messageHash },
  //   });

  //   await vr.write.completeVerification([claimant.account.address, signature], {
  //     account: attester.account,
  //   });

  //   // Try to complete again - should fail
  //   await assert.rejects(async () => {
  //     await vr.write.completeVerification(
  //       [claimant.account.address, signature],
  //       {
  //         account: attester.account,
  //       }
  //     );
  //   }, /Verification already completed/);
  // });

  // it('Should allow multiple attesters to verify the same claimant', async function () {
  //   const vr = await viem.deployContract('VerificationRegistry');

  //   // First attester initiates verification
  //   await vr.write.initVerification([claimant.account.address], {
  //     account: attester.account,
  //   });

  //   // Second attester initiates verification
  //   await vr.write.initVerification([claimant.account.address], {
  //     account: otherAccount.account,
  //   });

  //   // Both requests should exist
  //   const request1 = await vr.read.requests([
  //     attester.account.address,
  //     claimant.account.address,
  //   ]);
  //   const request2 = await vr.read.requests([
  //     otherAccount.account.address,
  //     claimant.account.address,
  //   ]);

  //   assert.notEqual(request1[2], 0n);
  //   assert.notEqual(request2[2], 0n);
  //   assert.notEqual(request1[2], request2[2]);
  // });

  // it('Should reject invalid signature length', async function () {
  //   const vr = await viem.deployContract('VerificationRegistry');

  //   // Initiate verification
  //   await vr.write.initVerification([claimant.account.address], {
  //     account: attester.account,
  //   });

  //   // Use invalid signature (too short)
  //   const invalidSignature = '0x1234';

  //   await assert.rejects(async () => {
  //     await vr.write.completeVerification(
  //       [claimant.account.address, invalidSignature],
  //       {
  //         account: attester.account,
  //       }
  //     );
  //   }, /Invalid signature length/);
  // });
});
