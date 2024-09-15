import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaSafeTransfer } from "../target/types/solana_safe_transfer";
import { Keypair, Transaction, Signer } from "@solana/web3.js";
import { expect } from "chai";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("solana-safe-transfer", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .SolanaSafeTransfer as Program<SolanaSafeTransfer>;
  const connection = anchor.getProvider().connection;

  const owner = anchor.getProvider().publicKey.toString();
  // @ts-expect-error
  const wallet = anchor.getProvider().wallet as any;

  it.skip("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .initialize()
      .accounts({
        signer: wallet.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Should transfer SOL with the right confirmation code", async () => {
    const sender = new Keypair();
    console.log("Sender", sender.publicKey.toString());

    // get pda address
    const [pda, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [wallet.publicKey.toBuffer(), Buffer.from("ca")],
      program.programId
    );

    console.log("PDA", pda.toString());

    // initialize sender account and transfer SOL to it
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
    console.log("Create account", sig0);

    const senderBalance = await connection.getBalance(
      sender.publicKey,
      "finalized"
    );

    console.log("Sender balance", senderBalance);

    // Transfer SOL
    const sig = await program.rpc.transferSol(new anchor.BN(1000000), "Hello", {
      accounts: {
        to: wallet.publicKey,
        from: sender.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        confirmationAccount: pda,
      },
      signers: [sender],
    });
    console.log("Transfer SOL", sig);

    try {
      await program.rpc.transferSol(new anchor.BN(1000000), "wrong code", {
        accounts: {
          to: wallet.publicKey,
          from: sender.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          confirmationAccount: pda,
        },
        signers: [sender],
      });
    } catch (e) {}

    // // Transfer SPL token
    // await program.rpc.transferSpl(new anchor.BN(10), {
    //   accounts: {
    //     fromTokenAccount: fromSplTokenAccount,
    //     toTokenAccount: toSplTokenAccount,
    //     fromAuthority: wallet.publicKey,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //   },
    // });
  });

  it.skip("Should transfer SPL tokens with the right confirmation code", async () => {
    const sender = new Keypair();
    console.log("Sender", sender.publicKey.toString());

    // get pda address
    const [pda, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [wallet.publicKey.toBuffer(), Buffer.from("ca")],
      program.programId
    );

    console.log("PDA", pda.toString());

    // initialize sender account and transfer SOL to it
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
    console.log("Create account", sig0);

    const senderBalance = await connection.getBalance(
      sender.publicKey,
      "finalized"
    );
    // TODO: send SPL tokens
    //
    // await program.rpc.transferSpl(new anchor.BN(10), {
    //   accounts: {
    //     fromTokenAccount: fromSplTokenAccount,
    //     toTokenAccount: toSplTokenAccount,
    //     fromAuthority: wallet.publicKey,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //   },
    // });
  });

  it("Should fails to transfer SOL with wrong confirmation code", async () => {
    const sender = new Keypair();
    console.log("Sender", sender.publicKey.toString());

    // get pda address
    const [pda, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [wallet.publicKey.toBuffer(), Buffer.from("ca")],
      program.programId
    );

    console.log("PDA", pda.toString());

    // initialize sender account and transfer SOL to it
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
    console.log("Create account", sig0);

    const senderBalance = await connection.getBalance(
      sender.publicKey,
      "finalized"
    );
    console.log("Sender balance", senderBalance);

    // Transfer SOL
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
      console.log("Transfer SOL sig", sig);
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
