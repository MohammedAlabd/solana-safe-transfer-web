import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaSafeTransfer } from "../target/types/solana_safe_transfer";
import { Transaction } from "@solana/web3.js";
import { expect } from "chai";
import {
  confirmTransaction,
  initializeKeypair,
} from "@solana-developers/helpers";
import createAndMintToken, { log } from "./helpers";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  getAccount,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import dotenv from "dotenv";
dotenv.config();

const debug = false;

describe("solana-safe-transfer", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .SolanaSafeTransfer as Program<SolanaSafeTransfer>;
  const connection = program.provider.connection;

  const owner = anchor.getProvider().publicKey;
  // @ts-expect-error
  const wallet = anchor.getProvider().wallet as Wallet;

  it("Is initialized!", async () => {
    const [confirmationPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [owner.toBuffer(), Buffer.from("ca")],
      program.programId
    );

    const tx = await program.methods
      .initialize()
      .accounts({
        signer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        confirmationAccount: confirmationPDA,
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
    const sender = await initializeKeypair(connection, {
      envVariableName: "SENDER_KEYPAIR",
    });
    log({ debug, message: ["Sender", sender.publicKey.toString()] });

    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [wallet.publicKey.toBuffer(), Buffer.from("ca")],
      program.programId
    );

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

  it("Should transfer SPL tokens with the right confirmation code", async () => {
    const sender = await initializeKeypair(connection, {
      envVariableName: "SENDER_KEYPAIR",
    });

    const tokenDecimals = 3;

    const {
      mint,
      ata: senderAta,
      sig: tokenSig,
    } = await createAndMintToken({
      payer: wallet,
      minter: sender.publicKey,
      connection,
      tokenName: "Test Token",
      tokenSymbol: "TT",
      tokenUri: "",
      decimals: tokenDecimals,
      amount: 100,
    });

    log({ debug, message: ["Token mint", mint.publicKey.toString()] });
    log({ debug, message: ["Sender Token ATA", senderAta.toString()] });
    log({ debug, message: ["Token sig", tokenSig] });

    const accountDetails = await getAccount(
      connection,
      senderAta,
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );
    log({ debug, message: ["Associate Token Account =====>", accountDetails] });

    const reciverPublicKey = owner;

    const [confirmationPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [reciverPublicKey.toBuffer(), Buffer.from("ca")],
      program.programId
    );

    const confirmationAccount = await program.account.confirmationAccount.fetch(
      confirmationPDA
    );

    const receiverAta = getAssociatedTokenAddressSync(
      mint.publicKey,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    log({ debug, message: ["receiverAta", receiverAta] });

    const createATAIx = createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      receiverAta,
      wallet.publicKey,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID
    );

    // Transfer SOL
    const transferSplIx = await program.methods
      .transferSpl(
        new anchor.BN(5 * 10 ** tokenDecimals),
        confirmationAccount.code
      )
      .accounts({
        mint: mint.publicKey,
        toAuthority: wallet.publicKey,
        fromAuthority: sender.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        confirmationAccount: confirmationPDA,
        toTokenAccount: receiverAta,
        fromTokenAccount: senderAta,
        systemProgram: anchor.web3.SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .instruction();

    const tx = new Transaction().add(createATAIx, transferSplIx);

    const recentBlockhash = await connection.getRecentBlockhash();
    tx.recentBlockhash = recentBlockhash.blockhash;

    tx.feePayer = sender.publicKey;
    wallet.signTransaction(tx);
    tx.partialSign(sender);

    const sig = await connection.sendRawTransaction(tx.serialize());
    await confirmTransaction(connection, sig, "confirmed");

    log({ debug, message: ["Transfer SOL", sig] });
  });

  it("Should throw when transfering SPL tokens with a wrong confirmation code", async () => {
    const sender = await initializeKeypair(connection, {
      envVariableName: "SENDER_KEYPAIR",
    });

    const tokenDecimals = 3;

    const {
      mint,
      ata: senderAta,
      sig: tokenSig,
    } = await createAndMintToken({
      payer: wallet,
      minter: sender.publicKey,
      connection,
      tokenName: "Test Token",
      tokenSymbol: "TT",
      tokenUri: "",
      decimals: tokenDecimals,
      amount: 100,
    });

    log({ debug, message: ["Token mint", mint.publicKey.toString()] });
    log({ debug, message: ["Sender Token ATA", senderAta.toString()] });
    log({ debug, message: ["Token sig", tokenSig] });

    const accountDetailsBefore = await getAccount(
      connection,
      senderAta,
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );

    log({
      debug,
      message: ["Associate Token Account =====>", accountDetailsBefore],
    });

    const reciverPublicKey = owner;

    const [confirmationPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [reciverPublicKey.toBuffer(), Buffer.from("ca")],
      program.programId
    );

    const confirmationAccount = await program.account.confirmationAccount.fetch(
      confirmationPDA
    );

    const receiverAta = getAssociatedTokenAddressSync(
      mint.publicKey,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    log({ debug, message: ["receiverAta", receiverAta] });

    const createATAIx = createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      receiverAta,
      wallet.publicKey,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID
    );

    try {
      // Transfer SOL
      const transferSplIx = await program.methods
        .transferSpl(new anchor.BN(5 * 10 ** tokenDecimals), "wrong code")
        .accounts({
          mint: mint.publicKey,
          toAuthority: wallet.publicKey,
          fromAuthority: sender.publicKey,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          confirmationAccount: confirmationPDA,
          toTokenAccount: receiverAta,
          fromTokenAccount: senderAta,
          systemProgram: anchor.web3.SystemProgram.programId,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .instruction();

      const tx = new Transaction().add(createATAIx, transferSplIx);

      const recentBlockhash = await connection.getRecentBlockhash();
      tx.recentBlockhash = recentBlockhash.blockhash;

      tx.feePayer = sender.publicKey;
      wallet.signTransaction(tx);
      tx.partialSign(sender);

      const sig = await connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: true,
      });
      await confirmTransaction(connection, sig, "confirmed");

      throw new Error("Should fail");
    } catch (e) {}

    const accountDetailsAfter = await getAccount(
      connection,
      senderAta,
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );

    expect(accountDetailsBefore.amount).eq(accountDetailsAfter.amount);
  });
});
