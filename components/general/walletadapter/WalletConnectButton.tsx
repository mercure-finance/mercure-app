"use client";
import dynamic from "next/dynamic";

const WalletConnectButton = () => {
  const WalletMultiButtonDynamic = dynamic(
    async () =>
      (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
  );
  return (
    <div>
      <WalletMultiButtonDynamic style={{ backgroundColor: "black" }} />
    </div>
  );
};

export default WalletConnectButton;
