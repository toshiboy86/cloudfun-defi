import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Hex, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk';
import { KERNEL_V3_1, getEntryPoint } from '@zerodev/sdk/constants';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { privateKeyToAccount } from 'viem/accounts';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { toKernelSmartAccount } from 'permissionless/accounts';
import { createSmartAccountClient } from 'permissionless';
import {
  createConfig,
  ChainId,
  getQuote,
  executeRoute,
  convertQuoteToRoute,
} from '@lifi/sdk';

const kernelVersion = KERNEL_V3_1;
const entryPoint = getEntryPoint('0.7');
const chain = baseSepolia;

// Backend private key for executing swaps
const BACKEND_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY as Hex;
const PIMLICO_API_KEY = process.env.PIMLICO_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const {
      smartAccountAddress,
      fromToken,
      toToken,
      fromAmount,
      fromChain,
      toChain,
    } = await request.json();

    if (!smartAccountAddress || !fromToken || !toToken || !fromAmount) {
      return NextResponse.json(
        { error: 'Missing required swap parameters' },
        { status: 400 }
      );
    }

    // Set up clients
    const publicClient = createPublicClient({
      transport: http(process.env.RPC_URL || 'https://sepolia.base.org'),
      chain,
    });

    const backendSigner = privateKeyToAccount(BACKEND_PRIVATE_KEY);

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer: backendSigner,
      entryPoint,
      kernelVersion,
    });

    // Create smart account client
    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      entryPoint,
      kernelVersion,
    });

    const kernelAccount = await toKernelSmartAccount({
      client: publicClient,
      entryPoint: {
        address: entryPoint.address,
        version: '0.7',
      },
      owners: [backendSigner],
      index: 0n,
      address: smartAccountAddress as Hex,
    });

    // Set up Pimlico paymaster
    const PAYMASTER_URL = `https://api.pimlico.io/v2/84532/rpc?apikey=${PIMLICO_API_KEY}`;

    const paymasterClient = createPimlicoClient({
      transport: http(PAYMASTER_URL),
      chain,
    });

    const smartAccountClient = createSmartAccountClient({
      account: kernelAccount,
      chain,
      paymaster: paymasterClient,
      bundlerTransport: http(PAYMASTER_URL),
      userOperation: {
        estimateFeesPerGas: async () =>
          (await paymasterClient.getUserOperationGasPrice()).fast,
      },
    });

    // Initialize LiFi
    createConfig({
      integrator: 'balance-aggregater',
    });

    // Get quote from LiFi
    const quote = await getQuote({
      fromAddress: smartAccountAddress,
      fromChain: fromChain as ChainId,
      toChain: toChain as ChainId,
      fromToken,
      toToken,
      fromAmount,
    });

    const route = convertQuoteToRoute(quote);

    // Execute the swap
    const executedRoute = await executeRoute(route, {
      updateRouteHook(route) {
        console.log('Route update:', route);
      },
    });

    return NextResponse.json({
      success: true,
      transactionHash: executedRoute.txHash,
      route: executedRoute,
      message: 'Swap executed successfully',
    });
  } catch (error) {
    console.error('Error executing swap:', error);
    return NextResponse.json(
      { error: 'Failed to execute swap' },
      { status: 500 }
    );
  }
}
