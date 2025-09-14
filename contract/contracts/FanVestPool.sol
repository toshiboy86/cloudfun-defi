// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
/**
 * @title FanVestPool
 * @dev A template contract for an individual artist's investment pool.
 * This contract also acts as the ERC-20 token for the "Fan LP" shares.
 * TODO: Use AA for Ownable msg.sender and signature verification from tx signer.
 */
contract FanVestPool is ERC20, Ownable {
 
    IERC20 public immutable usdcToken;
    // Address of the Aave V3 Pool contract on the chosen network
    address public immutable aavePoolAddress;
    // Address of the Aave aUSDC token contract
    address public immutable aUSDCAddress;

    string public spotifyArtistId;
    
    // Track total USDC deposited in this pool
    uint256 public totalUSDC;


    // Events
    event Deposit(address indexed user, uint256 usdcAmount, uint256 lpTokensMinted);
    event Withdraw(address indexed user, uint256 usdcAmount, uint256 lpTokensBurned);
    event Claim(address indexed admin, uint256 totalUSDC, uint256 earnedInterest);
  
    constructor(
      string memory _spotifyArtistId,
      address _usdcTokenAddress,
      string memory _tokenName,
      string memory _tokenSymbol,
      address _aavePoolAddress,
      address _aUSDCAddress,
      address _owner
    ) ERC20(_tokenName, _tokenSymbol) Ownable(_owner) {
        spotifyArtistId = _spotifyArtistId;
        usdcToken = IERC20(_usdcTokenAddress);
        aavePoolAddress = _aavePoolAddress;
        aUSDCAddress = _aUSDCAddress;
    }


    /**
     * @dev Invest all pooled USDC funds into Aave V3 to earn interest
     * This function should be called periodically by an admin to maximize returns
     */
    function _investPooledFunds() internal {
        uint256 usdcBalance = usdcToken.balanceOf(address(this));
        if (usdcBalance == 0) {
            return; // No USDC to invest, exit gracefully
        }
        
        // Check if Aave addresses are correctly configured
        // If not, this function will revert with a clear error message
        require(address(usdcToken) != aUSDCAddress, "Aave addresses not properly configured");
        
        // 1. Approve the Aave Pool contract to spend our USDC
        require(usdcToken.approve(aavePoolAddress, usdcBalance), "USDC approval failed");

        // 2. Deposit all USDC into Aave V3 Pool
        IPool(aavePoolAddress).supply(address(usdcToken), usdcBalance, address(this), 0);
    }

    /**
     * @dev Allows a fan to deposit USDC and receive Fan LP tokens in return.
     * Uses a simple 1:1 ratio: 1 USDC = 1 LP token.
     * @param _amount Amount of USDC to deposit (in wei, considering USDC has 6 decimals)
     */
    function deposit(uint256 _amount) external {
      require(_amount > 0, "Amount must be greater than 0");
      
      // A user must first approve this contract to spend their USDC.
      // This is a standard two-step process (approve -> transferFrom).
      
      // 1. Pull USDC from the user into this pool contract.
      require(usdcToken.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");
      
      // 2. Mint an equal amount of this pool's LP tokens to the user.
      _mint(msg.sender, _amount);
      
      // Update total USDC tracking
      totalUSDC += _amount;
      
      emit Deposit(msg.sender, _amount, _amount);

      _investPooledFunds();
    }


    /**
     * @dev Allows a fan to withdraw USDC by burning their LP tokens.
     * Calculates fair share based on total pool assets (liquid USDC + aUSDC from Aave).
     * @param lpAmount Amount of LP tokens to burn for USDC withdrawal
     */
    function withdraw(uint256 lpAmount) external {
        require(lpAmount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= lpAmount, "Insufficient LP token balance");
        
        // Calculate user's fair share of total pool assets
        uint256 totalAssets = getTotalAssets();
        uint256 totalSupply = totalSupply();
        require(totalSupply > 0, "No LP tokens in circulation");
        
        uint256 usdcToReturn = (lpAmount * totalAssets) / totalSupply;
        require(usdcToReturn > 0, "Withdrawal amount too small");
        
        // Check if we have enough liquid USDC, if not, withdraw from Aave
        uint256 liquidUSDC = usdcToken.balanceOf(address(this));
        if (liquidUSDC < usdcToReturn) {
            uint256 amountToWithdrawFromAave = usdcToReturn - liquidUSDC;
            
            // Approve Aave Pool to spend our aUSDC tokens
            IERC20(aUSDCAddress).approve(aavePoolAddress, amountToWithdrawFromAave);
            
            // Withdraw from Aave V3 Pool
            IPool(aavePoolAddress).withdraw(address(usdcToken), amountToWithdrawFromAave, address(this));
        }
        
        // 1. Burn the user's LP tokens
        _burn(msg.sender, lpAmount);
        
        // 2. Transfer calculated USDC amount to the user
        require(usdcToken.transfer(msg.sender, usdcToReturn), "USDC transfer failed");
        
        // Update total USDC tracking (approximate, since we're now earning interest)
        if (totalUSDC >= usdcToReturn) {
            totalUSDC -= usdcToReturn;
        } else {
            totalUSDC = 0;
        }
        
        emit Withdraw(msg.sender, usdcToReturn, lpAmount);
    }


    function _getEarnedInterest() internal view returns (uint256) {
        uint256 totalAssets = getTotalAssets();
         uint256 earnedInterest;
        if (totalAssets >= totalUSDC) {
            earnedInterest = totalAssets - totalUSDC;
        } else {
            earnedInterest = 0;
        }
        return earnedInterest;
    }


    /**
     * @dev Claim all USDC and earned interest (admin only)
     * Transfers all USDC and earned interest to the admin (owner)
     */
    function claim() external onlyOwner {
        uint256 totalAssets = getTotalAssets();
        require(totalAssets > 0, "No assets to claim");
        
        // Calculate earned interest (handle underflow case)
        uint256 earnedInterest = _getEarnedInterest();
        
        
        // Withdraw all aUSDC from Aave (if any)
        uint256 aUSDCBalance = IERC20(aUSDCAddress).balanceOf(address(this));
        if (aUSDCBalance > 0) {
            // Approve Aave Pool to spend all our aUSDC tokens
            IERC20(aUSDCAddress).approve(aavePoolAddress, aUSDCBalance);
            
            // Withdraw all aUSDC from Aave V3 Pool
            IPool(aavePoolAddress).withdraw(address(usdcToken), aUSDCBalance, address(this));
        }
        
        // Transfer all USDC and earned interest to admin
        require(usdcToken.transfer(owner(), totalAssets), "USDC transfer to admin failed");
        
        // Reset total USDC tracking
        totalUSDC = 0;
        
        emit Claim(msg.sender, totalUSDC, earnedInterest);
    }

    /**
     * @dev Get the current USDC balance of this pool
     * @return Current USDC balance held by this contract
     */
    function getPoolUSDCBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    /**
     * @dev Calculate total assets in the pool (liquid USDC + aUSDC from Aave including earning interest)
     * @return Total value of all assets in the pool
     */
    function getTotalAssets() public view returns (uint256) {
        uint256 liquidUSDC = usdcToken.balanceOf(address(this));
        
        // Temporarily disable aUSDC balance check if addresses are incorrect
        // This prevents the function from reverting due to wrong aUSDC address
        uint256 aUSDCBalance = 0;
        try IERC20(aUSDCAddress).balanceOf(address(this)) returns (uint256 balance) {
            aUSDCBalance = balance;
        } catch {
            // If aUSDC address is incorrect, just use 0
            aUSDCBalance = 0;
        }
        
        return liquidUSDC + aUSDCBalance;
    }

    /**
     * @dev Get pool information
     * @return artistId The Spotify artist ID for this pool
     * @return tokenName The name of the LP token
     * @return tokenSymbol The symbol of the LP token
     * @return totalUSDCAmount Total USDC deposited in this pool
     * @return totalSupplyAmount Total LP tokens minted
     */
    function getPoolInfo() external view returns (
        string memory artistId,
        string memory tokenName,
        string memory tokenSymbol,
        uint256 totalUSDCAmount,
        uint256 totalSupplyAmount,
        uint256 earnedInterest
    ) {
        return (spotifyArtistId, name(), symbol(), totalUSDC, totalSupply(), _getEarnedInterest());
    }

    /**
     * @dev Emergency function to withdraw all USDC (only owner)
     * This should only be used in emergency situations
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        if (balance > 0) {
            require(usdcToken.transfer(owner(), balance), "Emergency withdrawal failed");
            totalUSDC = 0;
        }
    }
}
