'use client';

import { Box, Heading, Text, Stack, HStack, Divider, Center } from '@chakra-ui/react';

export default function Hero() {
  return (
    <>
      <Stack as={Box} textAlign={'center'} spacing={{ base: 8, md: 14 }}>
        <Heading fontWeight={600} fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }} lineHeight={'110%'}>
          Solana Safe <br />
          <Text as={'span'} color={'green.400'}>
            Transfer
          </Text>
        </Heading>
        <Text color={'gray.500'}>
          Solana-Safe-Transfer is a secure and user-friendly solution for transferring tokens on the Solana network. By
          adding a confirmation code requirement, it prevents accidental errors and ensures your assets reach the right
          destination—perfect for both everyday transfers and high-value transactions.
        </Text>
        <HStack spacing={10}>
          <Text color={'gray.500'}>
            To receive Assets, Click on the "Get a Confirmation Code" button below, This will generate a confirmation
            code for your wallet and save it on-chain. Then you can share this code with anyone wants to send you tokens
          </Text>

          <Center height="100px">
            <Divider orientation="vertical" />
          </Center>

          <Text color={'gray.500'}>
            To send tokens, you can enter the confirmation code and the destination wallet address. This will ensure
            that you are not going to fat-finger the address and lose your assets
          </Text>
        </HStack>
      </Stack>
    </>
  );
}
