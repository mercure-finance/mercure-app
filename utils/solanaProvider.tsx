import { AnchorProvider, Provider } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import * as anchor from "@coral-xyz/anchor";

export function useSolanaProvider(): Provider | undefined {
  const [provider, setProvider] = useState<Provider>();

  const connection = new anchor.web3.Connection("http://localhost:8899");
  const { connected } = useWallet();
  const wallet = useAnchorWallet();

  useEffect(() => {
    if (connection && wallet && connected === true) {
      setProvider(
        new AnchorProvider(connection, wallet, {
          commitment: "confirmed",
        })
      );
    }
  }, [connected]);

  return provider;
}
