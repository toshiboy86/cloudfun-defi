import { NextResponse } from 'next/server';

// Sample data for demonstration
const sampleBalances = {
  totalBalances: {
    ETH: 2.3,
    USDC: 3000.0,
    USDT: 1500.0,
    DAI: 1000.0
  },
  individualBalances: {
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6': {
      ETH: '1.5',
      USDC: '1000.0',
      USDT: '500.0',
      DAI: '250.0'
    },
    '0x8ba1f109551bD432803012645Hac136c4c8e3e5': {
      ETH: '0.8',
      USDC: '2000.0',
      USDT: '1000.0',
      DAI: '750.0'
    }
  },
  summary: {
    totalAddresses: 2,
    totalTokens: 4,
    totalValueUSD: 5502.3
  }
};

export async function GET() {
  try {
    const response = {
      ...sampleBalances,
      timestamp: new Date().toISOString(),
      message: 'Sample balance aggregation data'
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Balance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

