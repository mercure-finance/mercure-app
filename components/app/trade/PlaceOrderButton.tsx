"use client";

import WalletConnectButton from "@/components/general/walletadapter/WalletConnectButton";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/useSession";
import { useWallet } from "@solana/wallet-adapter-react";

const PlaceOrder = () => {
  const wallet = useWallet();
  const session = useSession();
  return (
    <div>
      {wallet.publicKey ? (
        session.profile ? (
          <Button>Place limit Order</Button>
        ) : (
          <Button>Sign In</Button>
        )
      ) : (
        <WalletConnectButton />
      )}
    </div>
  );
};

export default PlaceOrder;
