"use client";

import useConfirmationCode from "@/components/program/useConfirmationCode";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  const {
    isLoading,
    confirmationCode,
    isAccountInitialized,
    initializeAccount,
  } = useConfirmationCode();
  const { connected } = useWallet();

  if (!connected) return <div>Connect Wallet</div>;

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="">
      <h1>{isLoading}</h1>
      <h1>Confirmation Code: {confirmationCode}</h1>
      <div>
        {!isAccountInitialized && (
          <button
            onClick={initializeAccount}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Get a Confirmation Code
          </button>
        )}
      </div>
    </div>
  );
}
