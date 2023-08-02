"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "@/context/useSession";
import WalletConnectButton from "../WalletConnectButton";
import { supabaseClient } from "@/utils/supabaseClient";
import { encode } from "bs58";

const CompleteRegistrationModal = () => {
  const wallet = useWallet();
  const session = useSession();

  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);

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
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className=" text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Sign In with:
                      </Dialog.Title>
                      <div className="mt-2">
                        <WalletConnectButton />
                        <button
                          disabled={loading || !wallet?.publicKey}
                          onClick={handleLogin}
                          className="bg-blue-500 rounded-lg p-3 mt-2 w-44 hover:bg-blue-700"
                        >
                          {loading ? "Loading..." : "Sign In"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CompleteRegistrationModal;
