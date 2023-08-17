"use client";

import WalletConnectButton from "@/components/general/walletadapter/WalletConnectButton";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/useSession";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSolanaProvider } from "@/utils/solanaProvider";
import * as anchor from "@coral-xyz/anchor";
import idl from "@/utils/idl/ousia_burn_and_mint.json";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { OusiaBurnAndMint } from "@/utils/idl/ousia-burn-and-mint";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

type PlaceOrderProps = {
  orderType: "buy" | "sell";
  amounts: {
    amount: number | undefined;
    price: string | undefined;
  };
};

const PlaceOrder = ({ orderType, amounts }: PlaceOrderProps) => {
  // Your code here

  const session = useSession();
  const provider = useSolanaProvider();
  const wallet = useAnchorWallet();
  const router = useRouter();
  const { toast: notify } = useToast();

  const createOrder = async (orderType: string) => {
    console.log(`Order type: ${orderType}`);
    if (!wallet?.publicKey) return;
    if (!provider) return;
    if (!session.profile) return;
    if (!amounts.amount) return;
    if (!amounts.price) return;
    const program = new anchor.Program<OusiaBurnAndMint>(
      idl as any,
      new anchor.web3.PublicKey("Fa63c9tRsE3uJ3GQ7q22KAWq38pq4tfyR2AkqpCprgay"),
      provider
    );

    const usdcPublicKey = new anchor.web3.PublicKey(
      "2CfbSGohKypGsvExvbJ6Fi4DVMynfFkY2JedfANnUuq1"
    );
    const tslaStockPublicKey = new anchor.web3.PublicKey(
      "66KE37YdUBxPZGTis4M976UfgHYCKcV7ZqTAP2dTsobv"
    );

    const orderID = anchor.web3.Keypair.generate();

    const orderAccountATA = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("order"),
        wallet.publicKey.toBuffer(),
        orderID.publicKey.toBuffer(),
      ],
      program.programId
    )[0];

    const orderUsdcATA = anchor.web3.PublicKey.findProgramAddressSync(
      [
        orderAccountATA.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        usdcPublicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];

    const orderPurchaseATA = anchor.web3.PublicKey.findProgramAddressSync(
      [
        orderAccountATA.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tslaStockPublicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];

    const signerUsdcATA = anchor.web3.PublicKey.findProgramAddressSync(
      [
        wallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        usdcPublicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];

    const signerPurchaseATA = anchor.web3.PublicKey.findProgramAddressSync(
      [
        wallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tslaStockPublicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];

    let order;

    if (orderType === "buy") {
      order = { buy: {} };
    } else if (orderType === "sell") {
      order = { sell: {} };
    } else {
      throw new Error("Invalid order type");
    }

    const parsedPrice = Number(amounts.price) * 10 ** 6;
    const price = new anchor.BN(parsedPrice);
    const amount = new anchor.BN(amounts.amount!);

    const signature = await program.methods
      .placeBuyOrder(amount, price, orderID.publicKey, order)
      .accounts({
        usdcMintAccount: usdcPublicKey,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        signer: wallet?.publicKey,
        buyerUsdcAta: signerUsdcATA,
        oderAccountUsdcAta: orderUsdcATA,
        orderAccount: orderAccountATA,
        mintAuthority: new anchor.web3.PublicKey(
          "44LZ5pUPJTc3TyrEu6qUgmwxS4HGkmxuTjpxj7iNeaRt"
        ),
        tokenProgram: TOKEN_PROGRAM_ID,
        purchaseTokenMintAccount: tslaStockPublicKey,
        buyerPurchaseTokenAccount: signerPurchaseATA,
        orderAccountPurchaseTokenAccount: orderPurchaseATA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    notify({
      title: "Transaction submitted",
      description: "Friday, February 10, 2023 at 5:57 PM",
      action: (
        <ToastAction
          altText="Transaction signature"
          onClick={() =>
            router.push(`https://explorer.solana.com/tx/${signature}`)
          }
        >
          View
        </ToastAction>
      ),
    });

    console.log(signature, "TRANSACTION SIGNATURE");
  };

  console.log(amounts);
  return (
    <div>
      {wallet?.publicKey ? (
        session.profile ? (
          <Button
            onClick={() => createOrder(orderType)}
            disabled={
              amounts.amount === undefined || amounts.price === undefined
            }
          >
            Place limit Order
          </Button>
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
