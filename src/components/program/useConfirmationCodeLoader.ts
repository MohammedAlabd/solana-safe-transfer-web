import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useSolanaSafeProgram } from './useSolanaSafeProgram';
const cacheKey = 'example-cache-key';

export const useConfirmationCodeLoader = () => {
  const { solanaSafeTransfer, wallet } = useSolanaSafeProgram();

  const getConfirmationCode = async () => {
    if (!wallet.publicKey || !solanaSafeTransfer) throw new Error('Wallet not connected');

    const [confirmationPDA] = PublicKey.findProgramAddressSync(
      [wallet.publicKey.toBuffer(), Buffer.from('ca')],
      solanaSafeTransfer.programId,
    );

    try {
      const res = await solanaSafeTransfer.account.confirmationAccount.fetch(confirmationPDA);
      return res.code;
    } catch (e: any) {
      if (e.message.includes('Account does not exist or has no data')) {
        return null;
      } else {
        throw e;
      }
    }
  };

  const { data, error, isLoading, refetch, isRefetching } = useQuery<string | null>({
    queryKey: [cacheKey],
    queryFn: getConfirmationCode,
  });

  return {
    data,
    error,
    isLoading,
    refetch,
    isRefetching,
  };
};
