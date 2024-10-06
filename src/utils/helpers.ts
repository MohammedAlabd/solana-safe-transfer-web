import { PublicKey } from '@solana/web3.js';

export const isSolanaPublicKey = (value: string) => {
  try {
    new PublicKey(value);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
