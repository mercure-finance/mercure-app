import "./globals.css";
import { Inter } from "next/font/google";
import WalletAdapter from "@/components/general/walletadapter";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ousia Finance",
  description: "Real world assets on the blockchain",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <WalletAdapter>{children}</WalletAdapter>
      </body>
    </html>
  );
};

export default RootLayout;
