// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FanVestPool.sol";

/**
 * @title FanVestFactory
 * @dev A central contract that acts as a registry and deploys new FanVestPool contracts for different artists.
 */
contract FanVestFactory {
    address public immutable usdcTokenAddress;
    address public immutable aavePoolAddress;
    address public immutable aUSDCAddress;
    
    // A mapping to keep track of created pools by Spotify Artist ID
    mapping(string => address) public artistPools;
    
    // Array to store all created pool addresses for enumeration
    address[] public allPools;
    
    // Mapping to check if a pool exists for an artist
    mapping(string => bool) public poolExists;
    
    // Events
    event PoolCreated(string indexed spotifyArtistId, address poolAddress, address creator);
    event PoolInfo(string spotifyArtistId, address poolAddress, string tokenName, string tokenSymbol);

    constructor(address _usdcTokenAddress, address _aavePoolAddress, address _aUSDCAddress) {
        require(_usdcTokenAddress != address(0), "Invalid USDC token address");
        require(_aavePoolAddress != address(0), "Invalid Aave Pool address");
        require(_aUSDCAddress != address(0), "Invalid aUSDC address");
        usdcTokenAddress = _usdcTokenAddress;
        aavePoolAddress = _aavePoolAddress;
        aUSDCAddress = _aUSDCAddress;
    }

    /**
     * @dev Creates and deploys a new FanVestPool for a given artist.
     * @param _spotifyArtistId The Spotify artist ID for the pool
     * @param _tokenName The name of the LP token (e.g., "Taylor Swift Fan LP")
     * @param _tokenSymbol The symbol of the LP token (e.g., "TSFAN")
     */
    function createPool(
        string memory _spotifyArtistId,
        string memory _tokenName,
        string memory _tokenSymbol,
        address _owner
    ) external {
        // Ensure a pool for this artist doesn't already exist
        require(!poolExists[_spotifyArtistId], "Pool already exists for this artist");
        require(bytes(_spotifyArtistId).length > 0, "Spotify artist ID cannot be empty");
        require(bytes(_tokenName).length > 0, "Token name cannot be empty");
        require(bytes(_tokenSymbol).length > 0, "Token symbol cannot be empty");
        require(_owner != address(0), "Owner cannot be zero address");

        // Deploy a new instance of the FanVestPool contract
        FanVestPool newPool = new FanVestPool(
            _spotifyArtistId,
            usdcTokenAddress,
            _tokenName,
            _tokenSymbol,
            aavePoolAddress,
            aUSDCAddress,
            _owner
        );

        // Store the new pool's address
        artistPools[_spotifyArtistId] = address(newPool);
        poolExists[_spotifyArtistId] = true;
        allPools.push(address(newPool));

        // Ownership is already set in the constructor, no need to transfer

        // Emit events
        emit PoolCreated(_spotifyArtistId, address(newPool), _owner);
        emit PoolInfo(_spotifyArtistId, address(newPool), _tokenName, _tokenSymbol);
    }

    /**
     * @dev Get the pool address for a specific artist
     * @param _spotifyArtistId The Spotify artist ID
     * @return The address of the pool contract, or address(0) if not found
     */
    function getPoolAddress(string memory _spotifyArtistId) external view returns (address) {
        return artistPools[_spotifyArtistId];
    }

    /**
     * @dev Check if a pool exists for a specific artist
     * @param _spotifyArtistId The Spotify artist ID
     * @return True if pool exists, false otherwise
     */
    function hasPool(string memory _spotifyArtistId) external view returns (bool) {
        return poolExists[_spotifyArtistId];
    }

    /**
     * @dev Get the total number of pools created
     * @return The number of pools created
     */
    function getPoolCount() external view returns (uint256) {
        return allPools.length;
    }

    /**
     * @dev Get pool address by index
     * @param _index The index in the allPools array
     * @return The address of the pool at the given index
     */
    function getPoolByIndex(uint256 _index) external view returns (address) {
        require(_index < allPools.length, "Index out of bounds");
        return allPools[_index];
    }

    /**
     * @dev Get all pool addresses (use with caution for large numbers of pools)
     * @return Array of all pool addresses
     */
    function getAllPools() external view returns (address[] memory) {
        return allPools;
    }

    /**
     * @dev Get pool information for a specific artist
     * @param _spotifyArtistId The Spotify artist ID
     * @return poolAddress The address of the pool
     * @return exists Whether the pool exists
     */
    function getPoolInfo(string memory _spotifyArtistId) external view returns (
        address poolAddress,
        bool exists
    ) {
        return (artistPools[_spotifyArtistId], poolExists[_spotifyArtistId]);
    }
}
