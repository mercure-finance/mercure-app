"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "@/context/useSession";
import WalletConnectButton from "../WalletConnectButton";
import { supabaseClient } from "@/utils/supabaseClient";
import { encode } from "bs58";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CompleteRegistrationModal = () => {
  const wallet = useWallet();
  const session = useSession();

  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState<boolean>(false);

  const handleLogin = async () => {
    if (session.session) {
      supabaseClient.auth.signOut();
    }
    if (wallet?.publicKey) {
      const nonce = Date.now();
      // @ts-ignore TODO: fix this
      const signature = await wallet.signMessage(Buffer.from(nonce.toString()));
      setLoading(true);
      const res = await fetch("/api/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_address: wallet.publicKey.toString(),
          nonce,
          signature: encode(signature),
        }),
      });
      const data = await res.json();

      if (data.token) {
        supabaseClient.auth.signInWithPassword({
          email: `${wallet.publicKey.toString()}@ousiafinance.xyz`,
          password: data.token,
        });
      }
      setLoading(false);
      setOpen(false);
    }
  };

  const cancelButtonRef = useRef(null);

  console.log(session);

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(
        "this was triggered",
        session.profile,
        session.loadingProfile
      );
      if (!session.session) {
        console.log("2 was triggered", session.profile, session.loadingProfile);
        setOpen(true);
      }
      if (session.profile && wallet.publicKey) {
        console.log("3 was triggered", session.profile, session.loadingProfile);
        if (session.profile.wallet_address !== wallet.publicKey.toString()) {
          console.log("4 was triggered");
          supabaseClient.auth.signOut();

          setOpen(true);
          console.log(open);
        }
      }
    }
  }, [wallet.publicKey, session.loadingProfile]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify your wallet</DialogTitle>
          <DialogDescription>
            Please verify that you really own this wallet by signing a
            cryptographic message. This is not an interaction with the
            blockchain.
            <br />
            By signing this message you agree that Mercure is not live and that
            no asset on Devnet has any financial value.
            <div className="mt-2">
              <WalletConnectButton />
              <Button
                disabled={loading || !wallet?.publicKey}
                onClick={handleLogin}
                className="bg-indigo-600 rounded-lg p-3 mt-2 w-44 hover:bg-blue-700"
              >
                {loading ? "Loading..." : "Sign In"}
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteRegistrationModal;
