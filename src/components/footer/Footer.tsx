'use client';

import { Box, chakra, Container, Stack, useColorModeValue, VisuallyHidden } from '@chakra-ui/react';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';
import { ReactNode } from 'react';

const SocialButton = ({ children, label, href }: { children: ReactNode; label: string; href: string }) => {
  return (
    <chakra.button
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      target="_blank"
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

export default function Footer() {
  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} color={useColorModeValue('gray.700', 'gray.200')}>
      <Container
        as={Stack}
        maxW={'6xl'}
        py={4}
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        justify={{ base: 'center', md: 'space-between' }}
        align={{ base: 'center', md: 'center' }}
      >
        <Stack direction={'row'} spacing={6}>
          <SocialButton label={'Twitter'} href={'https://x.com/Mohammed_allabd'}>
            <FaTwitter />
          </SocialButton>
          <SocialButton label={'Linkedin'} href={'https://www.linkedin.com/in/mohammed-alabd/'}>
            <FaLinkedin />
          </SocialButton>
          <SocialButton label={'Github'} href={'https://github.com/MohammedAlabd'}>
            <FaGithub />
          </SocialButton>
        </Stack>
      </Container>
    </Box>
  );
}
