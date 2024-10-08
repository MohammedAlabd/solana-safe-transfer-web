'use client';

import SafeTransfer from '@/components/main/SafeTransfer';
import ConfirmationCode from '@/components/main/ConfirmationCode';
import { useWallet } from '@solana/wallet-adapter-react';
import { Center, Container, Flex } from '@chakra-ui/react';
import Hero from '@/components/main/Hero';
import WalletConnectButton from '@/components/wallet/WalletConnectButton';

export default function Home() {
  const { connected } = useWallet();

  return (
    <Container maxW="900px">
      <Hero />
      {connected ? (
        <Flex minH={'100vh'} align={'center'} justify={'space-between'}>
          <ConfirmationCode />
          <SafeTransfer />
        </Flex>
      ) : (
        <Center mt="10">
          <WalletConnectButton />
        </Center>
      )}
    </Container>
  );
}
