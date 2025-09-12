import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { parseUnits, zeroAddress } from "viem";
import { network } from "hardhat";

describe("FanVest", function () {
  let mockUSDC: any;
  let mockAavePool: any;
  let mockAUSDC: any;
  let factory: any;
  let pool: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let publicClient: any;
  let viem: any;

  beforeEach(async function () {
    const { viem: viemInstance } = await network.connect();
    viem = viemInstance;
    publicClient = await viem.getPublicClient();
    [owner, user1, user2] = await viem.getWalletClients();

    // Deploy Mock USDC
    mockUSDC = await viem.deployContract("MockUSDC", ["Mock USDC", "USDC", 6]);

    // Deploy Mock Aave Pool and aUSDC
    mockAavePool = await viem.deployContract("MockAavePool", []);
    mockAUSDC = await viem.deployContract("MockAUSDC", []);

    // Set up the relationship between Aave Pool and aUSDC
    await mockAUSDC.write.setAavePool([mockAavePool.address], {
      account: owner.account,
    });
    await mockAavePool.write.setAToken([mockUSDC.address, mockAUSDC.address], {
      account: owner.account,
    });

    // Transfer some aUSDC tokens from owner to MockAavePool for testing
    await mockAUSDC.write.transfer(
      [mockAavePool.address, parseUnits("10000", 6)],
      { account: owner.account },
    );

    // Deploy FanVestFactory
    factory = await viem.deployContract("FanVestFactory", [
      mockUSDC.address,
      mockAavePool.address,
      mockAUSDC.address,
    ]);

    // Mint some USDC for testing
    await mockUSDC.write.mint([owner.account.address, parseUnits("10000", 6)]); // 10,000 USDC
    await mockUSDC.write.mint([user1.account.address, parseUnits("1000", 6)]); // 1,000 USDC
    await mockUSDC.write.mint([user2.account.address, parseUnits("1000", 6)]); // 1,000 USDC
  });

  describe("Factory", function () {
    it("Should create a new pool", async function () {
      const spotifyArtistId = "4iHNK0tOyZPYnBU7nGAgpQ";
      const tokenName = "Taylor Swift Fan LP";
      const tokenSymbol = "TSFAN";

      const tx = await factory.write.createPool(
        [spotifyArtistId, tokenName, tokenSymbol],
        {
          account: owner.account,
        },
      );

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      const logs = receipt.logs.filter(
        (log: any) => log.address === factory.address,
      );

      assert.equal(logs.length, 2);

      const poolAddress = await factory.read.artistPools([spotifyArtistId]);
      assert.notEqual(poolAddress, zeroAddress);

      // // Verify pool exists
      const hasPool = await factory.read.hasPool([spotifyArtistId]);
      assert.equal(hasPool, true);
    });

    it("Should not allow creating duplicate pools", async function () {
      const spotifyArtistId = "4iHNK0tOyZPYnBU7nGAgpQ";
      const tokenName = "Taylor Swift Fan LP";
      const tokenSymbol = "TSFAN";

      await factory.write.createPool(
        [spotifyArtistId, tokenName, tokenSymbol],
        {
          account: owner.account,
        },
      );

      await assert.rejects(async () => {
        await factory.write.createPool(
          [spotifyArtistId, tokenName, tokenSymbol],
          {
            account: owner.account,
          },
        );
      }, /Pool already exists for this artist/);
    });

    it("Should track multiple pools", async function () {
      // Create first pool
      await factory.write.createPool(["artist1", "Artist 1 LP", "A1LP"], {
        account: owner.account,
      });

      // Create second pool
      await factory.write.createPool(["artist2", "Artist 2 LP", "A2LP"], {
        account: owner.account,
      });

      const poolCount = await factory.read.getPoolCount();
      assert.equal(poolCount, 2n);

      const hasPool1 = await factory.read.hasPool(["artist1"]);
      const hasPool2 = await factory.read.hasPool(["artist2"]);
      assert.equal(hasPool1, true);
      assert.equal(hasPool2, true);
    });
  });

  describe("Pool", function () {
    beforeEach(async function () {
      // Create a pool for testing
      const createTx = await factory.write.createPool(
        ["4iHNK0tOyZPYnBU7nGAgpQ", "Taylor Swift Fan LP", "TSFAN"],
        {
          account: owner.account,
        },
      );

      const poolAddress = await factory.read.artistPools([
        "4iHNK0tOyZPYnBU7nGAgpQ",
      ]);

      pool = await viem.getContractAt("FanVestPool", poolAddress);
    });

    it("Should deposit USDC and mint LP tokens", async function () {
      // First, let's check if the contract is working by calling basic ERC20 functions
      try {
        const depositAmount = parseUnits("100", 6); // 100 USDC

        // Approve USDC spending
        await mockUSDC.write.approve([pool.address, depositAmount], {
          account: user1.account,
        });

        // Deposit USDC
        await pool.write.deposit([depositAmount], {
          account: user1.account,
        });

        // Check balances
        const balance = await pool.read.balanceOf([user1.account.address]);
        const totalUSDC = await pool.read.totalUSDC();
        const poolUSDCBalance = await pool.read.getPoolUSDCBalance();

        assert.equal(balance, depositAmount);
        assert.equal(totalUSDC, depositAmount);
        assert.equal(poolUSDCBalance, depositAmount);
      } catch (error) {
        console.log("❌ Contract is not working:", error);
        throw error;
      }
    });

    it("Should withdraw USDC and burn LP tokens", async function () {
      const depositAmount = parseUnits("100", 6); // 100 USDC

      // First deposit
      await mockUSDC.write.approve([pool.address, depositAmount], {
        account: user1.account,
      });
      await pool.write.deposit([depositAmount], {
        account: user1.account,
      });

      // Then withdraw
      const tx = await pool.write.withdraw([depositAmount], {
        account: user1.account,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      const logs = receipt.logs.filter(
        (log: any) => log.address.toLowerCase() === pool.address.toLowerCase(),
      );
      assert.equal(logs.length, 2);

      // Check balances
      const balance = await pool.read.balanceOf([user1.account.address]);
      const totalUSDC = await pool.read.totalUSDC();

      assert.equal(balance, 0n);
      assert.equal(totalUSDC, 0n);
    });

    it("Should not allow withdrawing more than balance", async function () {
      const depositAmount = parseUnits("100", 6);
      const withdrawAmount = parseUnits("200", 6);

      await mockUSDC.write.approve([pool.address, depositAmount], {
        account: user1.account,
      });
      await pool.write.deposit([depositAmount], {
        account: user1.account,
      });

      await assert.rejects(async () => {
        await pool.write.withdraw([withdrawAmount], {
          account: user1.account,
        });
      }, /Insufficient LP token balance/);
    });

    it("Should get pool information", async function () {
      const [artistId, totalUSDC, totalSupply] = await pool.read.getPoolInfo();

      assert.equal(artistId, "4iHNK0tOyZPYnBU7nGAgpQ");
      assert.equal(totalUSDC, 0n);
      assert.equal(totalSupply, 0n);
    });

    it("Should handle multiple users", async function () {
      const depositAmount1 = parseUnits("100", 6);
      const depositAmount2 = parseUnits("50", 6);

      // User 1 deposits
      await mockUSDC.write.approve([pool.address, depositAmount1], {
        account: user1.account,
      });
      await pool.write.deposit([depositAmount1], {
        account: user1.account,
      });

      // User 2 deposits
      await mockUSDC.write.approve([pool.address, depositAmount2], {
        account: user2.account,
      });
      await pool.write.deposit([depositAmount2], {
        account: user2.account,
      });

      // Check balances
      const balance1 = await pool.read.balanceOf([user1.account.address]);
      const balance2 = await pool.read.balanceOf([user2.account.address]);
      const totalUSDC = await pool.read.totalUSDC();

      assert.equal(balance1, depositAmount1);
      assert.equal(balance2, depositAmount2);
      assert.equal(totalUSDC, depositAmount1 + depositAmount2);
    });

    it("Should invest pooled funds into Aave", async function () {
      const depositAmount = parseUnits("100", 6); // 100 USDC

      // First deposit
      await mockUSDC.write.approve([pool.address, depositAmount], {
        account: user1.account,
      });
      await pool.write.deposit([depositAmount], {
        account: user1.account,
      });

      // Check initial balances
      const initialUSDCBalance = await pool.read.getPoolUSDCBalance();
      const initialAUSDCBalance = await mockAUSDC.read.balanceOf([
        pool.address,
      ]);
      assert.equal(initialUSDCBalance, depositAmount);
      assert.equal(initialAUSDCBalance, 0n);

      // Invest funds into Aave (only owner can do this)
      await pool.write.investPooledFunds({ account: owner.account });

      // Check balances after investment
      const finalUSDCBalance = await pool.read.getPoolUSDCBalance();
      const finalAUSDCBalance = await mockAUSDC.read.balanceOf([pool.address]);
      assert.equal(finalUSDCBalance, 0n); // All USDC should be invested
      assert.equal(finalAUSDCBalance, depositAmount); // Should have aUSDC tokens
    });

    it("Should calculate total assets correctly", async function () {
      const depositAmount = parseUnits("100", 6); // 100 USDC

      // First deposit
      await mockUSDC.write.approve([pool.address, depositAmount], {
        account: user1.account,
      });
      await pool.write.deposit([depositAmount], {
        account: user1.account,
      });

      // Check total assets before investment (should be liquid USDC only)
      let totalAssets = await pool.read.getTotalAssets();
      assert.equal(totalAssets, depositAmount);

      // Invest funds into Aave
      await pool.write.investPooledFunds({ account: owner.account });

      // Check total assets after investment (should be aUSDC only)
      totalAssets = await pool.read.getTotalAssets();
      assert.equal(totalAssets, depositAmount);
    });

    it("Should handle withdrawal with fair share calculation", async function () {
      const depositAmount = parseUnits("100", 6); // 100 USDC

      // First deposit
      await mockUSDC.write.approve([pool.address, depositAmount], {
        account: user1.account,
      });
      await pool.write.deposit([depositAmount], {
        account: user1.account,
      });

      // Invest funds into Aave
      await pool.write.investPooledFunds({ account: owner.account });

      // Withdraw half of the LP tokens
      const withdrawAmount = depositAmount / 2n;
      const initialUserBalance = await mockUSDC.read.balanceOf([
        user1.account.address,
      ]);

      await pool.write.withdraw([withdrawAmount], {
        account: user1.account,
      });

      // Check that user received USDC (should be withdrawn from Aave)
      const finalUserBalance = await mockUSDC.read.balanceOf([
        user1.account.address,
      ]);
      const usdcReceived = finalUserBalance - initialUserBalance;
      assert.equal(usdcReceived, withdrawAmount); // Should receive fair share

      // Check that LP tokens were burned
      const remainingLPBalance = await pool.read.balanceOf([
        user1.account.address,
      ]);
      assert.equal(remainingLPBalance, withdrawAmount); // Should have half remaining
    });

    it("Should not allow non-owner to invest pooled funds", async function () {
      const depositAmount = parseUnits("100", 6);

      await mockUSDC.write.approve([pool.address, depositAmount], {
        account: user1.account,
      });
      await pool.write.deposit([depositAmount], {
        account: user1.account,
      });

      await assert.rejects(async () => {
        await pool.write.investPooledFunds({ account: user1.account });
      }, /OwnableUnauthorizedAccount/);
    });
  });
});
