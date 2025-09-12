// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockAUSDC
 * @dev Mock contract that simulates Aave aUSDC token behavior for testing
 */
contract MockAUSDC is ERC20 {
    // Address of the Aave Pool contract (for burning tokens)
    address public aavePool;
    address public owner;
    
    event TokensBurned(address indexed from, uint256 amount);
    
    constructor() ERC20("Mock Aave USDC", "maUSDC") {
        owner = msg.sender;
        // Mint initial supply to the deployer for testing
        _mint(msg.sender, 1000000 * 10**6); // 1M tokens with 6 decimals
    }
    
    /**
     * @dev Set the Aave Pool address
     * @param _aavePool The address of the Aave Pool contract
     */
    function setAavePool(address _aavePool) external {
        require(msg.sender == owner, "Only owner can set Aave Pool");
        aavePool = _aavePool;
    }
    
    /**
     * @dev Mint tokens (only callable by Aave Pool)
     * @param to The address to mint tokens to
     * @param amount The amount to mint
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == aavePool, "Only Aave Pool can mint");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens (only callable by Aave Pool)
     * @param from The address to burn tokens from
     * @param amount The amount to burn
     */
    function burn(address from, uint256 amount) external {
        require(msg.sender == aavePool, "Only Aave Pool can burn");
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }
    
    /**
     * @dev Emergency mint function for testing (only owner)
     * @param to The address to mint tokens to
     * @param amount The amount to mint
     */
    function emergencyMint(address to, uint256 amount) external {
        require(msg.sender == owner, "Only owner can emergency mint");
        _mint(to, amount);
    }
}
