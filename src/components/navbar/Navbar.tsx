'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Flex, HStack, Button, Menu, MenuButton, MenuList, MenuItem, useColorModeValue } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import Image from 'next/image';

const ConnectWalletButton = dynamic(() => import('../wallet/WalletConnectButton'), { ssr: false });

function Navbar() {
  return (
    <header className="fixed top-0 z-10 w-full">
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <HStack spacing={8} alignItems={'center'}>
            <Box>
              <Image src={`/assets/sst.png`} alt="LOGO" height={100} width={100} />
            </Box>
          </HStack>
          <Flex alignItems={'center'}>
            <ConnectWalletButton />
            <Menu>
              <MenuButton marginX={2} colorScheme="teal" as={Button} rightIcon={<ChevronDownIcon />}>
                Devnet
              </MenuButton>
              <MenuList>
                <MenuItem disabled cursor={'not-allowed'} textColor={'gray'}>
                  Mainnet (coming soon)
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Box>
    </header>
  );
}

export default Navbar;
