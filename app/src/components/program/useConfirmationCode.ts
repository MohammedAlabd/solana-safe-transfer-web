"use client";

import { useSolanaSafeProgram } from "@/components/program/useSolanaSafeProgram";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useEffect, useState } from "react";

export default function useConfirmationCode() {
  const { solanaSafeTransfer, wallet, connection } = useSolanaSafeProgram();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAccountInitialized, setIsAccountInitialized] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState("");

  const initializeAccount = async () => {
    if (!solanaSafeTransfer || !wallet.publicKey) return;

    setIsInitializing(true);
    const [confirmationPDA] = PublicKey.findProgramAddressSync(
      [wallet.publicKey.toBuffer(), Buffer.from("ca")],
      solanaSafeTransfer.programId
    );

    const tx = await solanaSafeTransfer.methods
      .initialize()
      .accounts({
        signer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        confirmationAccount: confirmationPDA,
      })
      .rpc();

    await connection.confirmTransaction(tx, "confirmed");
    setIsInitializing(false);
    await getAccount();
  };

  const getAccount = async () => {
    setIsLoading(true);
    setConfirmationCode("");
    const [confirmationPDA] = PublicKey.findProgramAddressSync(
      [wallet.publicKey!.toBuffer(), Buffer.from("ca")],
      solanaSafeTransfer!.programId
    );
    try {
      const res = await solanaSafeTransfer?.account.confirmationAccount.fetch(
        confirmationPDA
      );
      setIsAccountInitialized(true);
      if (res) setConfirmationCode(res.code);
      setIsLoading(false);
    } catch (e: any) {
      if (e.message.includes("Account does not exist or has no data")) {
        setIsAccountInitialized(false);
      } else {
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.disconnecting) {
      setConfirmationCode("");
    }

    if (solanaSafeTransfer && wallet.connected && wallet.publicKey) {
      getAccount();
    }
  }, [
    wallet.connected,
    wallet.disconnecting,
    solanaSafeTransfer,
    connection,
    wallet.publicKey,
  ]);

  return {
    confirmationCode,
    isLoading,
    error,
    isAccountInitialized,
    isInitializing,
    initializeAccount,
  };
}
