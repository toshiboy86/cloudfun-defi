// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockAavePool
 * @dev Mock contract that simulates Aave V3 Pool behavior for testing
 */
contract MockAavePool {
    // Mapping to track deposits: asset => user => amount
    mapping(address => mapping(address => uint256)) public deposits;
    
    // Mapping to track aToken addresses for each asset
    mapping(address => address) public aTokens;
    
    event Deposit(address indexed asset, uint256 amount, address indexed onBehalfOf, uint16 referralCode);
    event Withdraw(address indexed asset, uint256 amount, address indexed to);
    
    constructor() {}
    
    /**
     * @dev Set the aToken address for a given asset
     * @param asset The underlying asset address
     * @param aToken The corresponding aToken address
     */
    function setAToken(address asset, address aToken) external {
        aTokens[asset] = aToken;
    }
    
    /**
     * @dev Mock deposit function that mints aTokens to the user
     * @param asset The asset being deposited
     * @param amount The amount being deposited
     * @param onBehalfOf The address that will receive the aTokens
     * @param referralCode The referral code (unused in mock)
     */
    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external {
        require(asset != address(0), "Invalid asset");
        require(amount > 0, "Amount must be greater than 0");
        require(onBehalfOf != address(0), "Invalid onBehalfOf");
        
        // Transfer the asset from the caller to this contract
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        
        // Update deposit tracking
        deposits[asset][onBehalfOf] += amount;
        
        // Transfer aTokens to the user (1:1 ratio for simplicity)
        address aToken = aTokens[asset];
        require(aToken != address(0), "aToken not set for this asset");
        require(IERC20(aToken).balanceOf(address(this)) >= amount, "Insufficient aToken balance");
        IERC20(aToken).transfer(onBehalfOf, amount);
        
        emit Deposit(asset, amount, onBehalfOf, referralCode);
    }
    
    /**
     * @dev Mock withdraw function that burns aTokens and returns the asset
     * @param asset The asset being withdrawn
     * @param amount The amount being withdrawn
     * @param to The address that will receive the asset
     * @return The amount actually withdrawn
     */
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256) {
        require(asset != address(0), "Invalid asset");
        require(amount > 0, "Amount must be greater than 0");
        require(to != address(0), "Invalid to address");
        
        // Check if we have enough of the asset
        uint256 availableAmount = IERC20(asset).balanceOf(address(this));
        require(availableAmount >= amount, "Insufficient asset balance");
        
        // Check if the caller has enough deposits
        require(deposits[asset][msg.sender] >= amount, "Insufficient deposit balance");
        
        // Update deposit tracking
        deposits[asset][msg.sender] -= amount;
        
        // Burn aTokens from the caller (1:1 ratio for simplicity)
        address aToken = aTokens[asset];
        require(aToken != address(0), "aToken not set for this asset");
        
        // Burn aTokens from the caller
        IERC20(aToken).transferFrom(msg.sender, address(this), amount);
        
        // Transfer the asset to the user
        IERC20(asset).transfer(to, amount);
        
        emit Withdraw(asset, amount, to);
        return amount;
    }
    
    /**
     * @dev Get the total amount deposited for a specific asset and user
     * @param asset The asset address
     * @param user The user address
     * @return The total amount deposited
     */
    function getDeposit(address asset, address user) external view returns (uint256) {
        return deposits[asset][user];
    }
}
