import { NextApiRequest, NextApiResponse } from "next";
import { PublicKey } from "@solana/web3.js";
import jwt from "jsonwebtoken";
import nacl from "tweetnacl";
import { SupabaseServerClient } from "@/utils/supabaseServerClient";
import bs58 from "bs58";

interface TokenPayload {
  wallet_address: string;
  nonce: string;
  signature: string;
}

export default async function authenticate(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ msg: "Method not allowed" });
  }

  const { wallet_address, nonce, signature }: TokenPayload = req.body;

  // Instantiate the wallet's public key
  const walletPublicKey = new PublicKey(wallet_address).toBytes();

  // Verify the signature
  if (
    !nacl.sign.detached.verify(
      new TextEncoder().encode(nonce),
      new Uint8Array(bs58.decode(signature)),
      new Uint8Array(walletPublicKey)
    )
  ) {
    return res.status(401).json({ msg: "Invalid signature" });
  }

  // Check if the user already exists

  const { data: userExists, error: userExistsError } =
    await SupabaseServerClient.from("users")
      .select("*")
      .eq("wallet_address", wallet_address)
      .single();

  console.log(userExists);

  if (userExists?.wallet_address) {
    res.status(200).json({ token: "hello" });
  }

  if (userExists === null) {
    const { data: user, error: createuserError } =
      await SupabaseServerClient.auth.admin.createUser({
        email_confirm: true,
        password: "hello",
        email: `${wallet_address}@ousiafinance.xyz`,
        user_metadata: { address: wallet_address },
      });
    if (createuserError) {
      console.error(createuserError);
    } else if (user) {
      const { error: insertProfileError } = await SupabaseServerClient.from(
        "users"
      ).insert([
        {
          wallet_address: wallet_address,
          kyc: false,
          id: user?.user.id,
        },
      ]);
      if (insertProfileError) {
        console.error(insertProfileError);
      } else {
        return res.status(200).json({ token: "hello" });
      }
    }
  }
}
