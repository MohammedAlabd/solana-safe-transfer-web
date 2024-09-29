import * as anchor from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import idl from "../../../../target/idl/solana_safe_transfer.json";
import { SolanaSafeTransfer } from "../../../../target/types/solana_safe_transfer";

export const useSolanaSafeProgram = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const [solanaSafeTransfer, setSolanaSafeTransfer] =
    useState<anchor.Program<SolanaSafeTransfer> | null>(null);

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
  }, [anchorWallet]);

  return { wallet, solanaSafeTransfer, connection };
};
