"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceOrder from "../trade/PlaceOrderButton";
import { useSolanaProvider } from "@/utils/solanaProvider";
import * as anchor from "@coral-xyz/anchor";
import idl from "@/utils/idl/collateralized_debt.json";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountIdempotentInstruction,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { OusiaBurnAndMint } from "@/utils/idl/ousia-burn-and-mint";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CryptoSwapInput } from "@/components/app/borrow/swap-input";
import {
  PythConnection,
  PythHttpClient,
  getPythProgramKeyForCluster,
} from "@pythnetwork/client";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { BorrowAmountInput } from "./BorrowAmountInput";
import { create } from "domain";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface OrderFormProps {
  stock_symbol: string;
  feed_id: string;
  feed_address: string;
  stock_image: string;
  stock_inversed: boolean;
}

type Stock = {
  address: string | null;
  created_at: string | null;
  id: string;
  image_url: string | null;
  name: string;
  symbol: string;
  price_feed_id: string;
} | null;

export type Asset = {
  name: string;
  symbol: string;
  mint: string;
  price_feed: string;
  price_feed_address: string;
  imageurl: string;
  price: number;
  decimals: number;
};

const BorrowForm = ({
  stock_symbol,
  stock_image,
  feed_id,
  feed_address,
  stock_inversed,
}: OrderFormProps) => {
  const provider = useSolanaProvider();
  const wallet = useWallet();
  const [currentStockPrice, setCurrentStockPrice] = useState<number>();
  const totalAmount = useState<number>(0);
  const [borrowAmount, setBorrowAmount] = useState<string>("");
  const { toast: notify } = useToast();
  const router = useRouter();
  const [borrowAssetPrice, setBorrowAssetPrice] = useState<
    number | undefined
  >();
  const [assets, setAssets] = useState<Asset[]>([
    {
      name: "US Dollar Coin",
      symbol: "USDC",
      mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
      price_feed: "Crypto.USDC/USD",
      price_feed_address: "5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7",
      imageurl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/1024px-Circle_USDC_Logo.svg.png",
      price: 1,
      decimals: 6,
    },
    {
      name: "EUROe Stablecoin",
      symbol: "EUROe",
      mint: "Dq4LDZPdbMaEjFdRZVANvmAd4iwTWA3WGSAkugcoHLkc",
      price_feed: "Crypto.EUROe/USD",
      decimals: 6,
      imageurl: "https://dev.euroe.com/persistent/token-icon/png/256x256.png",
      price: 1,
      price_feed_address: "C4FSVzHE38qse1Dq25bDQRzwso63LbWucxzLufn7SrkY",
    },
    {
      name: "Kamino USDH/USDC",
      symbol: "kUSDHUSDCo",
      mint: "EvLepoDXhscvLxbTQ7byj3NE6n6gSNJP3DeZx5k49uLm",
      price_feed: "Crypto.USDC/USD",
      decimals: 6,
      imageurl:
        "https://styles.redditmedia.com/t5_6qrg6t/styles/communityIcon_92h259miw7l91.png",
      price: 1,
      price_feed_address: "5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7",
    },
  ]);

  const [inputsCount, setInputsCount] = useState<number>(1);
  const [selectedAssets, setSelectedAssets] = useState<string[]>(["USDC"]); // Initialize with one default value
  const [openPositions, setOpenPositions] = useState<any>([]); // Initialize with one default value
  const [inputAmounts, setInputAmounts] = useState<number[]>(
    new Array(inputsCount).fill(0)
  );

  const handleAssetChange = (index: number, asset: string) => {
    const newAssets = [...selectedAssets];
    newAssets[index] = asset;
    setSelectedAssets(newAssets);
  };

  const handleAddInput = () => {
    setInputsCount(inputsCount + 1);

    // Find the next available asset that hasn't been selected yet
    const nextAvailableAsset = assets.find(
      (asset) => !selectedAssets.includes(asset.symbol)
    );

    setSelectedAssets([...selectedAssets, nextAvailableAsset?.symbol || ""]);
  };

  const handleRemoveInput = (index: number) => {
    const newAssets = [...selectedAssets];
    newAssets.splice(index, 1);
    setSelectedAssets(newAssets);
    setInputsCount(inputsCount - 1);
  };

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const pythConnection = new PythHttpClient(
    connection,
    getPythProgramKeyForCluster("devnet")
  );

  const fetchAllPrices = async () => {
    const data = await pythConnection.getData();
    console.log("DATA", data);
    let borrowAssetPrice = data.productPrice.get(feed_id)?.aggregate.price;
    if (stock_inversed) {
      borrowAssetPrice = 1 / borrowAssetPrice!;
    }
    setBorrowAssetPrice(borrowAssetPrice);

    const updatedAssets = await Promise.all(
      assets.map(async (asset) => {
        const price = data.productPrice.get(asset.price_feed)?.price;
        console.log("PROICE", price);
        return {
          ...asset,
          price: price || 0,
        };
      })
    );

    setAssets(updatedAssets);
  };

  console.log(assets);

  const fetchOpenPositions = async () => {
    const connection = new anchor.web3.Connection(clusterApiUrl("devnet"), {
      commitment: "confirmed",
    });

    if (!wallet?.publicKey) {
      return;
    }
    // @ts-ignore
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new anchor.Program(
      idl as anchor.Idl,
      new anchor.web3.PublicKey("EXeqAfY6BiBZbvbdGsw1EZgXapQMrJeLkGhEVCigAF6u"),
      provider
    );

    console.log("this was reached");

    let inversedQuoteBuffer = Buffer.alloc(1);

    if (stock_inversed) {
      inversedQuoteBuffer = Buffer.from([1]);
    }

    const assetAccount = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("asset"),
        new PublicKey(feed_address!).toBuffer(),
        inversedQuoteBuffer,
      ],
      program.programId
    )[0];

    console.log("assetAccount", assetAccount);

    const mintAccount = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("asset_account"), assetAccount.toBuffer()],
      program.programId
    )[0];

    const allOwnerPositions = await program.account.positionAccount.all([
      {
        memcmp: {
          offset: 8,
          bytes: wallet.publicKey.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 40,
          bytes: mintAccount.toBase58(),
        },
      },
    ]);

    console.log("ALL OWNER POSITIONS", allOwnerPositions);
    setOpenPositions(allOwnerPositions);
  };

  useEffect(() => {
    fetchAllPrices();
  }, []);

  useEffect(() => {
    if (!wallet?.publicKey) {
      return;
    }
    fetchOpenPositions();
  }, [wallet.publicKey]);

  const total = selectedAssets.reduce((acc, assetSymbol, index) => {
    const asset = assets.find((a) => a.symbol === assetSymbol);
    const amount = inputAmounts[index] || 0;
    return acc + (asset ? asset.price * amount : 0);
  }, 0);

  const executeBorrow = async () => {
    const connection = new anchor.web3.Connection(clusterApiUrl("devnet"), {
      commitment: "confirmed",
    });

    if (!wallet?.publicKey) {
      return;
    }
    // @ts-ignore
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new anchor.Program(
      idl as anchor.Idl,
      new anchor.web3.PublicKey("EXeqAfY6BiBZbvbdGsw1EZgXapQMrJeLkGhEVCigAF6u"),
      provider
    );

    console.log("FEED ADDRESS", feed_address!);
    console.log("HI THIS CALLED");

    let inversedQuoteBuffer = Buffer.alloc(1);

    if (stock_inversed) {
      inversedQuoteBuffer = Buffer.from([1]);
    }

    console.log("BUFFER VALUE", inversedQuoteBuffer);

    const assetAccount = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("asset"),
        new PublicKey(feed_address!).toBuffer(),
        inversedQuoteBuffer,
      ],
      program.programId
    )[0];

    console.log("assetAccount", assetAccount);

    const mintAccount = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("asset_account"), assetAccount.toBuffer()],
      program.programId
    )[0];

    console.log("mintAccount", mintAccount);

    const signerMintATA = anchor.web3.PublicKey.findProgramAddressSync(
      [
        wallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mintAccount.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];

    const createKey = anchor.web3.Keypair.generate();

    console.log("CREATE KEY", createKey.publicKey.toBase58());

    const positionAccount = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        assetAccount.toBuffer(),
        createKey.publicKey.toBuffer(),
      ],
      program.programId
    )[0];

    console.log("POSITION ACCOUNT", positionAccount.toBase58());

    console.log("FEED ADDRESS", feed_address!);

    const feedPublicKey = new anchor.web3.PublicKey(feed_address);

    console.log("after feed address log");

    const batchRemainingAccounts = assets.flatMap((asset) => [
      {
        pubkey: getAssociatedTokenAddressSync(
          new PublicKey(asset.mint),
          positionAccount,
          true,
          TOKEN_PROGRAM_ID
        ), // Use the appropriate public key for token account here
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: new anchor.web3.PublicKey(asset.price_feed_address),
        isWritable: false,
        isSigner: false,
      },
    ]);

    console.log("After mapping batchremaining");

    const mintAuthorityAccount = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint-authority"), mintAccount.toBuffer()],
      program.programId
    )[0];

    const transaction = new anchor.web3.Transaction();

    selectedAssets.forEach((selectedAssetSymbol, index) => {
      const asset = assets.find(
        (asset) => asset.symbol === selectedAssetSymbol
      );

      if (!asset) return; // Skip if asset not found

      const amount = inputAmounts[index] * 10 ** asset.decimals;
      const assetMint = new PublicKey(asset.mint);
      if (!wallet?.publicKey) {
        return;
      }
      const senderTokenAccount = getAssociatedTokenAddressSync(
        assetMint,
        wallet.publicKey,
        false,
        TOKEN_PROGRAM_ID
      ); // Retrieve this based on the selected asset and the owner

      const positionTokenAccount = getAssociatedTokenAddressSync(
        assetMint,
        positionAccount,
        true,
        TOKEN_PROGRAM_ID
      );

      const createPositionATAInstuction =
        createAssociatedTokenAccountIdempotentInstruction(
          wallet.publicKey,
          positionTokenAccount,
          positionAccount,
          assetMint
        );

      transaction.add(createPositionATAInstuction);

      console.log("amount", amount);

      const transferInstruction = createTransferCheckedInstruction(
        senderTokenAccount,
        assetMint,
        positionTokenAccount,
        wallet.publicKey,
        amount,
        asset.decimals,
        undefined,
        TOKEN_PROGRAM_ID
      );

      transaction.add(transferInstruction);
      console.log("TRANSFER INSTRUCTION added", transferInstruction);
    });

    const parsedBorrowAmount = parseFloat(borrowAmount);
    console.log("PARSED BORROW AMOUNT", parsedBorrowAmount);
    const realBorrowAmount = parsedBorrowAmount * 10 ** 6;
    console.log("REAL BORROW AMOUNT", realBorrowAmount);
    const instruction = await program.methods
      .openPosition(new anchor.BN(realBorrowAmount), stock_inversed)
      .accounts({
        signer: wallet.publicKey,
        assetAccount,
        mintAccount,
        mintAuthority: mintAuthorityAccount,
        associatedTokenAccount: signerMintATA,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        positionAccount,
        createKey: createKey.publicKey,
        priceFeed: new anchor.web3.PublicKey(feed_address!),
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts(batchRemainingAccounts)
      .instruction();

    transaction.add(instruction);

    transaction.feePayer = wallet.publicKey;

    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    transaction.sign(createKey);

    const signature = await wallet.sendTransaction(transaction, connection, {
      skipPreflight: true,
    });
    console.log("SIG", signature);
    notify({
      title: "Transaction submitted",
      description: "Loan created successfully",
      action: (
        <ToastAction
          altText="Transaction signature"
          onClick={() =>
            router.push(
              `https://explorer.solana.com/tx/${signature}?cluster=devnet`
            )
          }
        >
          View
        </ToastAction>
      ),
    });
  };

  const closePosition = async (
    positionPubkey: PublicKey,
    createKey: PublicKey
  ) => {
    const connection = new anchor.web3.Connection(clusterApiUrl("devnet"), {
      commitment: "confirmed",
    });

    if (!wallet?.publicKey) {
      return;
    }
    // @ts-ignore
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new anchor.Program(
      idl as anchor.Idl,
      new anchor.web3.PublicKey("EXeqAfY6BiBZbvbdGsw1EZgXapQMrJeLkGhEVCigAF6u"),
      provider
    );

    console.log("FEED ADDRESS", feed_address!);
    console.log("HI THIS CALLED");

    let inversedQuoteBuffer = Buffer.alloc(1);

    if (stock_inversed) {
      inversedQuoteBuffer = Buffer.from([1]);
    }

    console.log("BUFFER VALUE", inversedQuoteBuffer);

    const assetAccount = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("asset"),
        new PublicKey(feed_address!).toBuffer(),
        inversedQuoteBuffer,
      ],
      program.programId
    )[0];

    console.log("assetAccount", assetAccount);

    const mintAccount = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("asset_account"), assetAccount.toBuffer()],
      program.programId
    )[0];

    console.log("mintAccount", mintAccount);

    const signerMintATA = anchor.web3.PublicKey.findProgramAddressSync(
      [
        wallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mintAccount.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];

    console.log("FEED ADDRESS", feed_address!);

    const feedPublicKey = new anchor.web3.PublicKey(feed_address);

    console.log("after feed address log");

    const batchRemainingAccounts = assets.flatMap((asset) => [
      {
        pubkey: getAssociatedTokenAddressSync(
          new PublicKey(asset.mint),
          positionPubkey,
          true,
          TOKEN_PROGRAM_ID
        ), // Use the appropriate public key for token account here
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: new anchor.web3.PublicKey(asset.price_feed_address),
        isWritable: false,
        isSigner: false,
      },
    ]);

    console.log("After mapping batchremaining");

    const mintAuthorityAccount = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint-authority"), mintAccount.toBuffer()],
      program.programId
    )[0];

    const positionAccount = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("position"), assetAccount.toBuffer(), createKey.toBuffer()],
      program.programId
    )[0];

    const transaction = new anchor.web3.Transaction();

    const instruction = await program.methods
      .closePosition(
        stock_inversed,
        new anchor.web3.PublicKey(feed_address!),
        createKey
      )
      .accounts({
        signer: wallet.publicKey,
        assetAccount,
        mintAccount,
        mintAuthority: mintAuthorityAccount,
        associatedTokenAccount: signerMintATA,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        positionAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts(batchRemainingAccounts)
      .instruction();

    transaction.add(instruction);

    transaction.feePayer = wallet.publicKey;

    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const signature = await wallet.sendTransaction(transaction, connection, {
      skipPreflight: true,
    });
    console.log("SIG", signature);
    notify({
      title: "Transaction submitted",
      description: "Position closed successfully",
      action: (
        <ToastAction
          altText="Transaction signature"
          onClick={() =>
            router.push(
              `https://explorer.solana.com/tx/${signature}?cluster=devnet`
            )
          }
        >
          View
        </ToastAction>
      ),
    });
  };

  const SwapButton = () => {
    console.log("totallll", total);
    return (
      <div>
        <h2 className="mb-2">
          1 {stock_symbol}: {borrowAssetPrice}$
        </h2>
        {wallet?.publicKey ? (
          <Button
            className="bg-indigo-600 text-white px-3 py-2 rounded-md"
            onClick={executeBorrow}
            disabled={
              borrowAmount === "" ||
              total == 0 ||
              total * 0.65 < parseFloat(borrowAmount) * borrowAssetPrice!
            }
          >
            {borrowAmount === "" ||
            total == 0 ||
            total * 0.65 < parseFloat(borrowAmount) * borrowAssetPrice!
              ? "Insufficient collateral"
              : "Borrow"}
          </Button>
        ) : (
          <WalletMultiButton style={{ backgroundColor: "black" }} />
        )}
      </div>
    );
  };

  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account" className="text-white ">
          Borrow
        </TabsTrigger>
        <TabsTrigger value="password" className="text-white ">
          Redeem
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardContent className="mt-5">
            <div className="mt-3">
              <div className="flex space-x-2">
                <Badge>1</Badge>{" "}
                <h2 className="font-bold">Choose collateral assets</h2>
              </div>
              {Array.from({ length: inputsCount }).map((_, index) => (
                <div key={index} className="flex items-center">
                  <CryptoSwapInput
                    assets={assets.filter(
                      (asset) => !selectedAssets.includes(asset.symbol)
                    )}
                    className="mt-4 w-3/4"
                    tokenSymbol={selectedAssets[index]} // Update here
                    onAssetChange={(newAsset) =>
                      handleAssetChange(index, newAsset)
                    }
                    value={inputAmounts[index] || 0}
                    onAmountChange={(newAmount) => {
                      const updatedAmounts = [...inputAmounts];
                      updatedAmounts[index] = parseFloat(newAmount);
                      setInputAmounts(updatedAmounts);
                    }}
                    tokenImage={
                      assets.find(
                        (asset) => asset.symbol === selectedAssets[index]
                      )?.imageurl!
                    }
                  />
                  {index === inputsCount - 1 && (
                    <button
                      className="rounded-full w-10 h-10 bg-indigo-600 text-white ml-3 hover:bg-indigo-400 font-semibold text-3xl"
                      onClick={handleAddInput}
                    >
                      +
                    </button>
                  )}
                  {inputsCount > 1 && (
                    <button
                      className="rounded-full w-10 h-10 bg-indigo-600 text-white ml-3 hover:bg-indigo-400 font-semibold text-3xl"
                      onClick={() => handleRemoveInput(index)}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex space-x-2">
                <Badge>2</Badge>{" "}
                <h2 className="font-bold">Choose borrow amount</h2>
              </div>
            </div>
            <BorrowAmountInput
              className="mt-3"
              asset={stock_symbol}
              icon={stock_image}
              onAmountChange={(amount) => setBorrowAmount(amount)}
              value={borrowAmount}
            />
          </CardContent>
          <CardFooter>
            <SwapButton />
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardContent className="mt-5">
            <div className="mt-3">
              {openPositions.length === 0 ? (
                <p>There are no open positions.</p>
              ) : (
                openPositions.map((position: any, index: number) => (
                  <Card key={index} className="mb-3">
                    <CardHeader>
                      <h1 className="font-bold text-xl">
                        {position.account.amount.toNumber() / 10 ** 6} $
                        {stock_symbol}
                      </h1>
                    </CardHeader>
                    <CardHeader>
                      <Button
                        className="bg-indigo-600 text-white "
                        onClick={() =>
                          closePosition(
                            position.publicKey,
                            position.account.createKey
                          )
                        }
                      >
                        Close Position
                      </Button>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default BorrowForm;
