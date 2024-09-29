"use client";
import React from "react";
import dynamic from "next/dynamic";

const ConnectWalletButton = dynamic(
  () => import("../wallet/WalletConnectButton"),
  { ssr: false }
);

function Navbar() {
  return (
    <header className="fixed top-0 z-10 w-full">
      <nav className="container mx-auto px-5 py-3 md:px-16">
        <div className="flex items-center justify-between">
          <ConnectWalletButton />
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
