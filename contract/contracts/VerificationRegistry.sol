// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract VerificationRegistry {
  struct VerificationRequest {
    address claimant;
    address attester;
    uint256 nonce;
    uint64 timestamp;
    bool completed;
  }

error InvalidAddress();

  mapping(address => mapping(address => VerificationRequest)) public requests;

  mapping(address => bool) public isVerified;

  event VerificationInitiated(address indexed attester, address indexed claimant, uint256 nonce);

  event Verified(address indexed attester, address indexed claimant, uint64 timestamp);

  function initVerification(address claimant) external {
    _validateAddress(claimant);
    require(requests[claimant][msg.sender].nonce == 0, "Already requested");

    uint256 nonce = uint256(
      keccak256(abi.encodePacked(block.timestamp, msg.sender, claimant, blockhash(block.number - 1)))
    );

    requests[claimant][msg.sender] = VerificationRequest({
      attester: msg.sender,
      claimant: claimant,
      nonce: nonce,
      timestamp: uint64(block.timestamp),
      completed: false
    });

    emit VerificationInitiated(msg.sender, claimant, nonce);
  }

  function completeVerification(address attester, bytes calldata signature) external {
    VerificationRequest storage req = requests[msg.sender][attester];
    require(req.nonce != 0, "No request found");
    require(!req.completed, "Verification already completed");

    bytes32 messageHash = keccak256(
      abi.encodePacked(
        "I confirm that I will not scam the user:",
        req.claimant,
        req.attester,
        req.nonce,
        req.timestamp,
        address(this)
      )
    );

    bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));

    (bytes32 r, bytes32 s, uint8 v) = _splitSignature(signature);

    address recoveredClaimant = ecrecover(ethSignedHash, v, r, s);

    require(recoveredClaimant == req.claimant, "Invalid signature");

    req.completed = true;
    isVerified[msg.sender] = true;

    emit Verified(msg.sender, attester, uint64(block.timestamp));
  }

  function _splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
    require(sig.length == 65, "Invalid signature length");
    assembly {
      r := mload(add(sig, 32))
      s := mload(add(sig, 64))
      v := byte(0, mload(add(sig, 96)))
    }
  }

  function _validateAddress(address addr) private pure {
    if (addr == address(0)) {
      revert InvalidAddress();
    }
  }
}
