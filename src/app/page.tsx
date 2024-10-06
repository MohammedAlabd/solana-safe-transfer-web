'use client';

import SafeTransfer from '@/components/main/SafeTransfer';
import ConfirmationCode from '@/components/main/ConfirmationCode';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  const { connected } = useWallet();

  if (!connected) return <div>Connect Wallet</div>;

  return (
    <>
      <ConfirmationCode />
      <SafeTransfer />
    </>
  );
}
