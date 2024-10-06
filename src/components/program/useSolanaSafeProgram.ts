import * as anchor from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import idl from '../../programs/solana-safe-transfer/idl.json';
import { SolanaSafeTransfer } from '../../programs/solana-safe-transfer/types';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js';

export type SafeTransferSOLMethodType = (_: {
  reciverPublicKey: PublicKey;
  confirmationCode: string;
  amount: number;
}) => Promise<void>;

export const useSolanaSafeProgram = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const [solanaSafeTransfer, setSolanaSafeTransfer] = useState<anchor.Program<SolanaSafeTransfer> | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    if (anchorWallet) {
      let provider: anchor.Provider;

      try {
        provider = anchor.getProvider();
      } catch {
        provider = new anchor.AnchorProvider(connection, anchorWallet, {});
        anchor.setProvider(provider);
      }

      setSolanaSafeTransfer(new anchor.Program(idl as anchor.Idl) as any);
    }
  }, [anchorWallet, connection]);

  const safeTransferSOL: SafeTransferSOLMethodType = async (options) => {
    const { reciverPublicKey, confirmationCode, amount } = options;
    if (!solanaSafeTransfer || !wallet.publicKey) return;

    setIsTransferring(true);

    const [confirmationPDA] = PublicKey.findProgramAddressSync(
      [reciverPublicKey.toBuffer(), Buffer.from('ca')],
      solanaSafeTransfer.programId,
    );

    try {
      const tx = await solanaSafeTransfer.methods
        .transferSol(new anchor.BN(amount * LAMPORTS_PER_SOL), confirmationCode)
        .accounts({
          to: reciverPublicKey,
          from: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          confirmationAccount: confirmationPDA,
        })
        .rpc();
      console.log('Transaction:', tx);

      await connection.confirmTransaction(tx);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setIsTransferring(false);
    }
  };

  return { wallet, solanaSafeTransfer, connection, safeTransferSOL, isTransferring };
};
