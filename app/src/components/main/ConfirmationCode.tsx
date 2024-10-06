'use client';

import { useConfirmationCodeLoader } from '@/components/program/useConfirmationCodeLoader';
import { useSolanaSafeProgram } from '../program/useSolanaSafeProgram';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useCallback, useState } from 'react';

export default function ConfirmationCode() {
  const { isLoading, data: confirmationCode, error, refetch, isRefetching } = useConfirmationCodeLoader();
  const { solanaSafeTransfer, wallet, connection } = useSolanaSafeProgram();

  const [isInitializing, setIsInitializing] = useState(false);

  const initializeAccount = useCallback(async () => {
    if (!solanaSafeTransfer || !wallet.publicKey) return;

    setIsInitializing(true);
    const [confirmationPDA] = PublicKey.findProgramAddressSync(
      [wallet.publicKey.toBuffer(), Buffer.from('ca')],
      solanaSafeTransfer.programId,
    );

    const tx = await solanaSafeTransfer.methods
      .initialize()
      .accounts({
        signer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        confirmationAccount: confirmationPDA,
      })
      .rpc();

    await connection.confirmTransaction(tx);
    setIsInitializing(false);
    refetch();
  }, [wallet.publicKey, wallet.connected, solanaSafeTransfer]);

  if (isLoading || isRefetching || isInitializing) return <div>Loading...</div>;

  if (error) return <div>error: {error.message}</div>;

  if (!confirmationCode) {
    return (
      <div className="">
        <div>
          <button
            onClick={initializeAccount}
            disabled={isInitializing}
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Get a Confirmation Code
          </button>
        </div>
      </div>
    );
  }

  return <h3>Confirmation Code: {confirmationCode}</h3>;
}
