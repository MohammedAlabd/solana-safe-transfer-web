import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaSafeTransfer } from "../target/types/solana_safe_transfer";
import { Keypair, Transaction } from "@solana/web3.js";
import { expect } from "chai";
import { initializeKeypair } from "@solana-developers/helpers";
import { log } from "./helpers";

const debug = true;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("solana-safe-transfer", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .SolanaSafeTransfer as Program<SolanaSafeTransfer>;
  const connection = program.provider.connection;

  const owner = anchor.getProvider().publicKey;
  // @ts-expect-error
  const wallet = anchor.getProvider().wallet as any;

  it("Is initialized!", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        signer: wallet.publicKey,
      })
      .rpc();

    await connection.confirmTransaction(tx, "confirmed");
    const txDetails = await program.provider.connection.getTransaction(tx, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    const logs = txDetails?.meta?.logMessages || null;
    log({ debug, message: ["Logs", logs] });

    if (!logs) {
      log({ debug, message: ["No logs found"] });
    }
    log({ debug, message: ["Your transaction signature", tx] });
  });

  it("Should transfer SOL with the right confirmation code", async () => {
    const sender = await initializeKeypair(connection, {
      envVariableName: "SENDER_KEYPAIR",
    });
    log({ debug, message: ["Sender", sender.publicKey.toString()] });

    const reciverPublicKey = owner;

    const [confirmationPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [reciverPublicKey.toBuffer(), Buffer.from("ca")],
      program.programId
    );

    const confirmationAccount = await program.account.confirmationAccount.fetch(
      confirmationPDA
    );

    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [wallet.publicKey.toBuffer(), Buffer.from("ca")],
      program.programId
    );

    const senderBalance = await connection.getBalance(
      sender.publicKey,
      "finalized"
    );

    log({ debug, message: ["Sender balance", senderBalance] });

    const sig = await program.rpc.transferSol(
      new anchor.BN(1000000),
      confirmationAccount.code,
      {
        accounts: {
          to: wallet.publicKey,
          from: sender.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          confirmationAccount: pda,
        },
        signers: [sender],
      }
    );
    log({ debug, message: ["Transfer SOL", sig] });

    try {
      const tx = await program.rpc.transferSol(
        new anchor.BN(1000000),
        "wrong code",
        {
          accounts: {
            to: wallet.publicKey,
            from: sender.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            confirmationAccount: pda,
          },
          signers: [sender],
        }
      );

      await connection.confirmTransaction(tx, "confirmed");
      const txDetails = await program.provider.connection.getTransaction(tx, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });

      const logs = txDetails?.meta?.logMessages || null;
      log({ debug, message: ["Logs", logs] });

      if (!logs) {
        log({ debug, message: ["No logs found"] });
      }
      log({ debug, message: ["Your transaction signature", tx] });
    } catch (e) {}
  });

  it("Should fails to transfer SOL with wrong confirmation code", async () => {
    const sender = new Keypair();
    log({ debug, message: ["Sender", sender.publicKey.toString()] });

    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [wallet.publicKey.toBuffer(), Buffer.from("ca")],
      program.programId
    );

    log({ debug, message: ["PDA", pda.toString()] });

    const tx = new Transaction().add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: sender.publicKey,
        lamports: 1000000000,
        space: 0,
        programId: anchor.web3.SystemProgram.programId,
      })
    );

    const sig0 = await connection.sendTransaction(tx, [wallet.payer, sender]);
    await connection.confirmTransaction(sig0, "confirmed");
    log({ debug, message: ["Create account", sig0] });

    const senderBalance = await connection.getBalance(
      sender.publicKey,
      "finalized"
    );
    log({ debug, message: ["Sender balance", senderBalance] });

    try {
      const sig = await program.rpc.transferSol(
        new anchor.BN(1000000),
        "wrong code",
        {
          accounts: {
            to: wallet.publicKey,
            from: sender.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            confirmationAccount: pda,
          },
          signers: [sender],
        }
      );
      log({ debug, message: ["Transfer SOL sig", sig] });
      throw new Error("Should fail");
    } catch (e) {
      expect(e.error.errorCode.code).eq("InvalidConfirmationCode");
    }

    const senderBalanceAfter = await connection.getBalance(
      sender.publicKey,
      "finalized"
    );
    expect(senderBalanceAfter).eq(senderBalance);
  });

});
