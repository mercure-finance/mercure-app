import * as anchor from "@coral-xyz/anchor";
import idl from "./idl/ousia_burn_and_mint.json";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const wallet = useAnchorWallet();

async function getProvider() {
  if (!wallet?.publicKey) {
    return;
  }

  const network = "http://127.0.0.1:8899";
  const connection = new anchor.web3.Connection(network, {
    commitment: "confirmed",
  });

  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return provider;
}

const createOrder = async () => {
  if (!wallet?.publicKey) {
    return;
  }

  const provider = await getProvider();
  const program = new anchor.Program(
    idl as anchor.Idl,
    new anchor.web3.PublicKey("EXeqAfY6BiBZbvbdGsw1EZgXapQMrJeLkGhEVCigAF6u"),
    provider
  );

  const orderAccountIdKeypair = anchor.web3.Keypair.generate();
  const usdcMintKeypair = anchor.web3.Keypair.generate();
  const purchaseMintKeypair = anchor.web3.Keypair.generate();

  const signerUsdcATA = anchor.web3.PublicKey.findProgramAddressSync(
    [
      wallet.publicKey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      usdcMintKeypair.publicKey.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];

  const signerPurchaseATA = anchor.web3.PublicKey.findProgramAddressSync(
    [
      wallet.publicKey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      purchaseMintKeypair.publicKey.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];

  const orderAccountATA = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("order"),
      wallet.publicKey.toBuffer(),
      orderAccountIdKeypair.publicKey.toBuffer(),
    ],
    program.programId
  )[0];

  const orderUsdcATA = anchor.web3.PublicKey.findProgramAddressSync(
    [
      orderAccountATA.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      usdcMintKeypair.publicKey.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];

  const orderPurchaseATA = anchor.web3.PublicKey.findProgramAddressSync(
    [
      orderAccountATA.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      purchaseMintKeypair.publicKey.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];

  const tx = await program.methods
    .placeBuyOrder(
      new anchor.BN(100),
      new anchor.BN(21135321),
      orderAccountIdKeypair.publicKey
    )
    .accounts({
      usdcMintAccount: usdcMintKeypair.publicKey,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      signer: wallet.publicKey,
      buyerUsdcAta: signerUsdcATA,
      oderAccountUsdcAta: orderUsdcATA,
      orderAccount: orderAccountATA,
      mintAuthority: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      purchaseTokenMintAccount: purchaseMintKeypair.publicKey,
      buyerPurchaseTokenAccount: signerPurchaseATA,
      orderAccountPurchaseTokenAccount: orderPurchaseATA,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
};
