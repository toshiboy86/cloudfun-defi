import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '../components/WalletProvider';
import { SpotifyProvider } from '../contexts/SpotifyContext';
import { HeaderWrapper } from '../components/HeaderWrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Balance Aggregator - Smart Wallet DApp',
  description:
    'Cross-chain balance aggregation and swapping with smart wallet technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          <SpotifyProvider>
            <HeaderWrapper />
            {children}
          </SpotifyProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
