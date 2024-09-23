import * as web3 from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToCheckedInstruction,
  ExtensionType,
  getAssociatedTokenAddress,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";
import { Wallet } from "@coral-xyz/anchor";
import { confirmTransaction } from "@solana-developers/helpers";

export const log = (options: { debug?: Boolean; message: any }) => {
  const shouldLog = options.debug || process.env.DEBUG;
  if (shouldLog) {
    console.log(...options.message);
  }
};

export default async function createAndMintToken(inputs: {
  payer: Wallet;
  minter: web3.PublicKey;
  connection: web3.Connection;
  tokenName: string;
  tokenSymbol: string;
  tokenUri: string;
  decimals: number;
  amount: number;
}) {
  const {
    payer,
    minter,
    connection,
    tokenName,
    tokenSymbol,
    tokenUri,
    decimals,
    amount,
  } = inputs;

  const mint = web3.Keypair.generate();

  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    name: tokenName,
    symbol: tokenSymbol,
    uri: tokenUri,
    additionalMetadata: [],
  };

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
  const lamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen
  );

  const createMintAccountInstruction = web3.SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    lamports,
    newAccountPubkey: mint.publicKey,
    programId: TOKEN_2022_PROGRAM_ID,
    space: mintLen,
  });

  const initMetadataPointerInstruction =
    createInitializeMetadataPointerInstruction(
      mint.publicKey,
      payer.publicKey,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID
    );

  const initMintInstruction = createInitializeMintInstruction(
    mint.publicKey,
    decimals,
    payer.publicKey,
    payer.publicKey,
    TOKEN_2022_PROGRAM_ID
  );

  const initMetadataInstruction = createInitializeInstruction({
    programId: TOKEN_2022_PROGRAM_ID,
    mint: mint.publicKey,
    metadata: mint.publicKey,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    mintAuthority: payer.publicKey,
    updateAuthority: payer.publicKey,
  });

  const ata = await getAssociatedTokenAddress(
    mint.publicKey,
    minter,
    false,
    TOKEN_2022_PROGRAM_ID
  );
  const createATAInstruction = createAssociatedTokenAccountInstruction(
    payer.publicKey,
    ata,
    minter,
    mint.publicKey,
    TOKEN_2022_PROGRAM_ID
  );

  const mintIX = createMintToCheckedInstruction(
    mint.publicKey,
    ata,
    payer.publicKey,
    amount * 10 ** decimals,
    decimals,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  const transaction = new web3.Transaction().add(
    createMintAccountInstruction,
    initMetadataPointerInstruction,
    initMintInstruction,
    initMetadataInstruction,
    createATAInstruction,
    mintIX
  );

  const recentBlockhash = await connection.getRecentBlockhash();
  transaction.recentBlockhash = recentBlockhash.blockhash;

  transaction.feePayer = payer.publicKey;
  payer.signTransaction(transaction);
  transaction.partialSign(mint);

  const sig = await connection.sendRawTransaction(transaction.serialize());
  await confirmTransaction(connection, sig, "confirmed");

  return { sig: sig, mint, ata };
}
