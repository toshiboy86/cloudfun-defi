'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import {
  createConfig,
  ChainId,
  getQuote,
  executeRoute,
  convertQuoteToRoute,
  QuoteRequest,
  ChainType,
  getTokens,
} from '@lifi/sdk';
import { createAcrossClient } from '@across-protocol/app-sdk';

// Permissionless
// import { toKernelSmartAccount, createSmartAccountClient } from 'permissionless';
import { createPimlicoClient } from 'permissionless/clients/pimlico';

// Viem
import {
  EIP1193Provider,
  createPublicClient,
  http,
  createWalletClient,
  custom,
  parseEther,
  TransactionRequest,
} from 'viem';
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
  sepolia,
} from 'viem/chains';

// ZeroDev
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk';
import { KERNEL_V3_1, getEntryPoint } from '@zerodev/sdk/constants';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';

// const tokens = await getTokens({
//   chainTypes: [ChainType.EVM],
// });
// Object.keys(tokens.tokens).forEach((idx) => {
//   tokens.tokens[idx].forEach((token) => {
//     if (token.chainId == 8453 && token.symbol === 'ETH') {
//       console.log(token);
//     }
//   });
// });
interface SmartAccountState {
  smartAccountAddress: string | null;
  isLoading: boolean;
  error: string | null;
  kernelAccount: any | null;
  kernelClient: any | null;
}

interface SwapParams {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromChain: number;
  toChain: number;
}

export function useSmartAccount() {
  const { user, authenticated, signMessage, sendTransaction } = usePrivy();

  const [state, setState] = useState<SmartAccountState>({
    smartAccountAddress: null,
    isLoading: false,
    error: null,
    kernelAccount: null,
    kernelClient: null,
  });

  const smartWallets = useSmartWallets();

  // Configuration matching smart-account-pimlico.ts
  const kernelVersion = KERNEL_V3_1;
  const entryPoint = getEntryPoint('0.7');
  const chain = baseSepolia;
  
  const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
  const PAYMASTER_URL = `https://api.pimlico.io/v2/84532/rpc?apikey=${PIMLICO_API_KEY}`;

  // Initialize LiFi config
  useEffect(() => {
    createConfig({
      integrator: 'balance-aggregater',
    });
  }, []);

  // Create Kernel client with Privy provider
  const createKernelClient = useCallback(async () => {
    if (!user?.wallet?.address || !window.ethereum) {
      setState((prev) => ({
        ...prev,
        error: 'Wallet not connected or ethereum provider not available',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('Creating Kernel client with Privy provider...');

      // For now, we'll use a simplified approach that works with Privy
      // The smart account will be created using Privy's built-in smart wallet
      const smartAccountAddress = user?.wallet?.address;

      console.log('Using Privy smart wallet address:', smartAccountAddress);

      setState((prev) => ({
        ...prev,
        smartAccountAddress,
        kernelAccount: null,
        kernelClient: null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error creating Kernel client:', error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create Kernel client',
        isLoading: false,
      }));
    }
  }, [user?.wallet?.address]);

  const createSmartAccount = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address) {
      setState((prev) => ({
        ...prev,
        error: 'Please connect your wallet first',
      }));
      return;
    }

    // Use the Kernel client creation function
    await createKernelClient();
  }, [authenticated, user?.wallet?.address, createKernelClient]);

  // Test function using Privy's sendTransaction
  const testSendTransaction = useCallback(async () => {
    if (!sendTransaction) {
      setState((prev) => ({
        ...prev,
        error: 'Send transaction not available. Please connect wallet first.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('Testing transaction with Privy...');

      // Test transaction using Privy's sendTransaction
      const txHash = await sendTransaction({
        to: '0x386Ab4CA67f7AbFd8d1095674bd6F55a4b9EE29D',
        value: 0n,
        data: '0x',
        gasLimit: 21000n, // Set a reasonable gas limit for simple transfer
      });

      console.log('Test transaction successful:', txHash);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
      }));

      return { success: true, txHash };
    } catch (error) {
      console.error('Test transaction failed:', error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Test transaction failed',
        isLoading: false,
      }));
    }
  }, [sendTransaction]);

  const doTest = useCallback(
    async (params: SwapParams) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // try {
      //   // Get quote from LiFi
      //   const quoteRequest: QuoteRequest = {
      //     fromChain: 8453, // Base
      //     toChain: 1, // Ethereum
      //     fromToken: '0x0000000000000000000000000000000000000000', // ETH on Base
      //     toToken: '0x0000000000000000000000000000000000000000', // ETH on Ethereum
      //     fromAmount: parseEther('0.001').toString(), // 0.001 ETH in wei (18 decimals)
      //     // The address from which the tokens are being transferred.
      //     fromAddress: '0x903Cd57011fcE5A1a40dBf617653A451Df4e6671',
      //     toAddress: '0x903Cd57011fcE5A1a40dBf617653A451Df4e6671',
      //   };

      //   const quote = await getQuote(quoteRequest);

      //   const route = convertQuoteToRoute(quote);

      //   console.log('Executed route:', route.steps[0].transactionRequest);
      //   console.log('smartWallets.client', smartWallets.client);
      //   const txHash = await swapToken(route.steps[0].transactionRequest);
      //   console.log('Transaction hash:', txHash);

      //   setState((prev) => ({ ...prev, isLoading: false }));
      //   return txHash;
      // } catch (error) {
      //   setState((prev) => ({
      //     ...prev,
      //     error: error instanceof Error ? error.message : 'Unknown error',
      //     isLoading: false,
      //   }));
      // }
    },
    [state.kernelClient, state.smartAccountAddress]
  );

  const swapToken = useCallback(async () => {
    if (!smartWallets.client) {
      setState((prev) => ({
        ...prev,
        error: 'Smart wallet client not ready',
      }));
      return;
    }
    console.log('1');
    const client = createAcrossClient({
      integratorId: '0x968f', // 2-byte hex string
      chains: [chain, sepolia],
      useTestnet: true,
    });
    console.log('2');
    const route = {
      originChainId: baseSepolia.id,
      destinationChainId: sepolia.id,
      inputToken: '0x0000000000000000000000000000000000000000' as `0x${string}`, // USDC
      outputToken:
        '0x0000000000000000000000000000000000000000' as `0x${string}`, // Native ETH
    };
    console.log('3', smartWallets.client.account.address);
    try {
      const swapQuote = await client.getSwapQuote({
        route,
        depositor: smartWallets.client.account.address,
        recipient: smartWallets.client.account.address,
        amount: parseEther('0.0001').toString(),
      });

      console.log('swapQuote', swapQuote);

      const txHash = await smartWallets.client.sendTransaction(
        swapQuote.swapTx!
      );

      console.log('swapQuote', txHash);
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
    }

    // console.log('swapQuote', swapQuote);
    // const quoteRequest: RoutesRequest = {
    //   fromChainId: 1, // Ethereum
    //   toChainId: 8453, // Base
    //   fromTokenAddress: '0x0000000000000000000000000000000000000000', // ETH on Base
    //   toTokenAddress: '0x0000000000000000000000000000000000000000', // ETH on Ethereum
    //   fromAmount: parseEther('0.00016').toString(), // 0.001 ETH in wei (18 decimals)
    //   // The address from which the tokens are being transferred.
    //   fromAddress: '0x903Cd57011fcE5A1a40dBf617653A451Df4e6671',
    //   toAddress: '0x903Cd57011fcE5A1a40dBf617653A451Df4e6671',
    // };
    // Get quote from LiFi
    // const quoteRequest: QuoteRequest = {
    //   fromChain: 1, // Ethereum
    //   toChain: 8453, // Base
    //   fromToken: '0x0000000000000000000000000000000000000000', // ETH on Base
    //   toToken: '0x0000000000000000000000000000000000000000', // ETH on Ethereum
    //   fromAmount: parseEther('0.02').toString(), // 0.001 ETH in wei (18 decimals)
    //   // The address from which the tokens are being transferred.
    //   fromAddress: '0x903Cd57011fcE5A1a40dBf617653A451Df4e6671',
    //   toAddress: '0x903Cd57011fcE5A1a40dBf617653A451Df4e6671',
    // };

    // const quote = await getQuote(quoteRequest);
    // console.log('FULL QUOTE DETAILS:', JSON.stringify(quote, null, 2));
    // const route = convertQuoteToRoute(quote);

    // console.log('Executed route:', route.steps[0].transactionRequest);

    // const transactionRequest = route.steps[0].transactionRequest!;

    // const txHash = await smartWallets.client.sendTransaction(
    //   transactionRequest
    // );
    // transactionRequest!
    // {
    //   to: transactionRequest.to as `0x${string}`,
    //   // value: transactionRequest.value as bigint,
    //   data: transactionRequest.data,
    // }
    // {
    //   to: '0x386Ab4CA67f7AbFd8d1095674bd6F55a4b9EE29D',
    //   value: 0n,
    //   data: '0x',
    // }
    // console.log('Transaction hash:', txHash);
    // return txHash;
    return swapQuote;
  }, [smartWallets.client]);

  return {
    ...state,
    createSmartAccount,
    createKernelClient,
    doTest,
    testSendTransaction,
    isConnected: authenticated && !!user?.wallet?.address,
    userAddress: user?.wallet?.address,
    swapToken,
  };
}
