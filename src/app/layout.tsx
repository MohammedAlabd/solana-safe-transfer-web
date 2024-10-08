import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Navbar from '@/components/navbar/Navbar';
import Providers from '@/components/navbar/Providers';
import { Flex } from '@chakra-ui/react';
import Footer from '@/components/footer/Footer';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Solana Safe Transfer',
  description: 'Transfer Solana tokends safely',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Navbar />
          <Flex minH="100vh" pt={{ md: 20, sm: 70 }} justify={'center'} bg="gray.50">
            {children}
          </Flex>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
