import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Hex, verifyMessage } from 'viem';
import { baseSepolia } from 'viem/chains';
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk';
import { KERNEL_V3_1, getEntryPoint } from '@zerodev/sdk/constants';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { privateKeyToAccount } from 'viem/accounts';

const kernelVersion = KERNEL_V3_1;
const entryPoint = getEntryPoint('0.7');
const chain = baseSepolia;

// This would be your backend private key for creating smart accounts
// In production, you should use a secure key management system
const BACKEND_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY as Hex;

export async function POST(request: NextRequest) {
  try {
    const { address, signature, message } = await request.json();

    if (!address || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the signature to ensure the user owns the wallet
    const publicClient = createPublicClient({
      transport: http(process.env.RPC_URL || 'https://sepolia.base.org'),
      chain,
    });

    const isValidSignature = await verifyMessage({
      address: address as Hex,
      message,
      signature: signature as Hex,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Create smart account for the user
    const backendSigner = privateKeyToAccount(BACKEND_PRIVATE_KEY);

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer: backendSigner,
      entryPoint,
      kernelVersion,
    });

    // Create the smart account
    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      entryPoint,
      kernelVersion,
    });

    // In a real application, you would:
    // 1. Store the smart account address in your database
    // 2. Associate it with the user's wallet address
    // 3. Set up proper key management

    return NextResponse.json({
      success: true,
      smartAccountAddress: account.address,
      message: 'Smart account created successfully',
    });
  } catch (error) {
    console.error('Error creating smart account:', error);
    return NextResponse.json(
      { error: 'Failed to create smart account' },
      { status: 500 }
    );
  }
}
