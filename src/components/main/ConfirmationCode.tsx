'use client';

import {
  Box,
  Center,
  Text,
  Stack,
  Button,
  useColorModeValue,
  HStack,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
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

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyConfirmationCode = useCallback(() => {
    if (!confirmationCode) return;

    navigator.clipboard.writeText(confirmationCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [confirmationCode]);

  return (
    <Center py={6}>
      <Box
        maxW={'330px'}
        w={'full'}
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow={'2xl'}
        rounded={'md'}
        overflow={'hidden'}
        p={6}
      >
        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error?.message}.</AlertDescription>
          </Alert>
        )}

        {confirmationCode ? (
          <Stack textAlign={'center'} p={6} color={'gray.800'} align={'center'}>
            <Stack direction={'column'} align={'center'} justify={'center'}>
              <Text fontSize={'xl'}>Your Confirmation Code:</Text>

              <HStack>
                <Text fontSize={'2xl'} fontWeight={800}>
                  {confirmationCode}
                </Text>
                <IconButton
                  onClick={handleCopyConfirmationCode}
                  aria-label="copy"
                  icon={isCopied ? <CheckIcon /> : <CopyIcon />}
                />
              </HStack>
            </Stack>
          </Stack>
        ) : (
          <Stack align={'center'}>
            <Text>You don't have a confirmation code yet</Text>
            <Button
              marginX={2}
              maxW="200px"
              colorScheme="teal"
              onClick={initializeAccount}
              disabled={isInitializing}
              isLoading={isInitializing || isRefetching || isLoading}
            >
              Get a Confirmation Code
            </Button>
          </Stack>
        )}
      </Box>
    </Center>
  );
}
