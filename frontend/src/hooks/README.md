# Smart Contract RPC Calls

This directory contains React hooks for interacting with the FanVest smart contracts using RPC calls.

## Available Hooks

### `useSmartContract()`
The main hook that provides access to both FanVestFactory and FanVestPool functions.

```typescript
import { useSmartContract } from './hooks/useSmartContract';

function MyComponent() {
  const { hasPool, getPoolInfo, getPoolDetails, isLoading, error } = useSmartContract();
  
  // Use the functions...
}
```

### `useFanVestFactory()`
Hook for interacting with the FanVestFactory contract.

**Functions:**
- `hasPool(artistId: string)` - Check if a pool exists for an artist
- `getPoolInfo(artistId: string)` - Get pool address and existence status
- `getPoolAddress(artistId: string)` - Get pool address for an artist
- `getPoolCount()` - Get total number of pools created
- `getAllPools()` - Get all pool addresses

### `useFanVestPool(poolAddress?: string)`
Hook for interacting with individual FanVestPool contracts.

**Functions:**
- `getPoolInfo(address?: string)` - Get comprehensive pool information
- `getPoolUSDCBalance(address?: string)` - Get current USDC balance
- `getTotalAssets(address?: string)` - Get total assets (USDC + aUSDC)
- `getSpotifyArtistId(address?: string)` - Get Spotify artist ID
- `getTokenName(address?: string)` - Get LP token name
- `getTokenSymbol(address?: string)` - Get LP token symbol
- `getTotalSupply(address?: string)` - Get total LP token supply

## Usage Examples

### Check if Pool Exists

```typescript
import { useSmartContract } from './hooks/useSmartContract';

function CheckPool() {
  const { hasPool, isLoading, error } = useSmartContract();
  const [artistId, setArtistId] = useState('');
  const [poolExists, setPoolExists] = useState<boolean | null>(null);

  const handleCheck = async () => {
    try {
      const exists = await hasPool(artistId);
      setPoolExists(exists);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <input 
        value={artistId} 
        onChange={(e) => setArtistId(e.target.value)} 
        placeholder="Enter Artist ID"
      />
      <button onClick={handleCheck} disabled={isLoading}>
        {isLoading ? 'Checking...' : 'Check Pool'}
      </button>
      {poolExists !== null && (
        <p>Pool exists: {poolExists ? 'Yes' : 'No'}</p>
      )}
    </div>
  );
}
```

### Get Pool Information

```typescript
import { useSmartContract } from './hooks/useSmartContract';

function PoolInfo() {
  const { getPoolInfo, getPoolDetails } = useSmartContract();
  const [poolInfo, setPoolInfo] = useState(null);
  const [poolDetails, setPoolDetails] = useState(null);

  const handleGetInfo = async (artistId: string) => {
    try {
      // Get basic pool info from factory
      const info = await getPoolInfo(artistId);
      setPoolInfo(info);
      
      // Get detailed info from pool contract
      if (info.exists && info.poolAddress) {
        const details = await getPoolDetails(info.poolAddress);
        setPoolDetails(details);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      {/* Your UI components */}
    </div>
  );
}
```

### Programmatic Usage (Outside React Components)

```typescript
import { useSmartContract } from './hooks/useSmartContract';

async function checkArtistPool(artistId: string) {
  const { hasPool, getPoolInfo } = useSmartContract();
  
  try {
    const exists = await hasPool(artistId);
    console.log('Pool exists:', exists);
    
    if (exists) {
      const info = await getPoolInfo(artistId);
      console.log('Pool info:', info);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Configuration

### Environment Variables

Set these environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_FANVEST_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_DEPOSIT_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_AUSDC_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
```

### Contract Addresses

Update the contract addresses in `src/config/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  FANVEST_FACTORY: '0x...', // Your deployed factory address
  USDC: '0x...', // USDC token address
  AAVE_POOL: '0x...', // Aave V3 Pool address
  AUSDC: '0x...', // Aave aUSDC address
};
```

## Error Handling

All hooks include error handling and loading states:

```typescript
const { hasPool, isLoading, error } = useSmartContract();

// Check loading state
if (isLoading) {
  return <div>Loading...</div>;
}

// Check for errors
if (error) {
  return <div>Error: {error}</div>;
}
```

## TypeScript Types

The hooks provide TypeScript types for better development experience:

```typescript
import { PoolInfo, PoolDetails } from './hooks/useSmartContract';

// PoolInfo from factory
interface PoolInfo {
  poolAddress: string;
  exists: boolean;
}

// PoolDetails from pool contract
interface PoolDetails {
  artistId: string;
  tokenName: string;
  tokenSymbol: string;
  totalUSDCAmount: bigint;
  totalSupplyAmount: bigint;
}
```

## Dependencies

- `viem` - For Ethereum interactions
- `react` - For React hooks
- Contract ABIs from `src/artifacts/`

## Network Support

Currently configured for Sepolia testnet. To use other networks, update the chain configuration in the hook files.
