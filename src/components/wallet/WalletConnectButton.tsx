'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function WalletConnectButton() {
  return (
    <WalletMultiButton
      style={{
        height: '2.5rem',
        display: 'flex', // Use flexbox layout
        justifyContent: 'center', // Center children horizontally
        alignItems: 'center', // Center children vertically
        borderRadius: '0.375rem', // rounded-full
        // border: '1px solid #737373', // border and border-neutral-500
        // padding: '0.75rem', // p-3
        fontWeight: '500', // font-medium
        lineHeight: '1.25', // leading-tight
        color: '#fff', // text-neutral-300
        backgroundColor: '#14b8a6', // bg-gold-500
        transition: 'background-color 0.2s ease-in-out', // For smooth hover and active transitions
        cursor: 'pointer', // Ensure the cursor is a pointer on hover
      }}
    />
  );
}
