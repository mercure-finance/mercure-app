"use client";

import {
  WhirlpoolContext,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  PDAUtil,
  ORCA_WHIRLPOOLS_CONFIG,
  buildWhirlpoolClient,
  buildDefaultAccountFetcher,
  swapQuoteByInputToken,
  WhirlpoolIx,
  toTx,
  increaseLiquidityQuoteByInputToken,
  TickUtil,
  PriceMath,
} from "@orca-so/whirlpools-sdk";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { BorrowAmountInput } from "../borrow/BorrowAmountInput";
import * as anchor from "@coral-xyz/anchor";
import { Percentage } from "@orca-so/common-sdk/";
import Decimal from "decimal.js";
import { MathUtil, DecimalUtil } from "@orca-so/common-sdk";
import { initializePoolIx } from "@orca-so/whirlpools-sdk/dist/instructions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface TradeCardProps {
  stockAddress: string;
  stockImage: string;
}

const TradeCard = ({ stockAddress, stockImage }: TradeCardProps) => {
  const [swapAmount, setSwapAmount] = useState("");
  const [estimatedOutput, setEstimatedOutput] = useState(null);
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const assetMint = new PublicKey(stockAddress);
  const [startPrice, setStartPrice] = useState("");
  const [endPrice, setEndPrice] = useState("");
  const connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com"
  );

  const provider = new anchor.AnchorProvider(connection, anchorWallet!, {
    commitment: "confirmed",
  });

  const ctx = WhirlpoolContext.withProvider(
    provider,
    ORCA_WHIRLPOOL_PROGRAM_ID
  );

  const createPool = async () => {
    const whirlpoolClient = buildWhirlpoolClient(ctx);
    const desiredMarketPrice = new Decimal(1);
    // Invert due to token mint ordering
    const actualPrice = new Decimal(1).div(desiredMarketPrice);
    // Shift by 64 bits
    const initSqrtPrice = MathUtil.toX64(actualPrice);
    const usdcPublicKey = new PublicKey(
      "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
    );
    const whirlpoolPda = PDAUtil.getWhirlpool(
      ORCA_WHIRLPOOL_PROGRAM_ID,
      new PublicKey("FcrweFY1G9HJAHG5inkGB6pKg1HZ6x9UC2WioAfWrGkR"),
      usdcPublicKey,
      assetMint,
      128
    );

    const createPoolTx = await whirlpoolClient.createPool(
      new PublicKey("FcrweFY1G9HJAHG5inkGB6pKg1HZ6x9UC2WioAfWrGkR"),
      usdcPublicKey,
      assetMint,
      128,
      Number(initSqrtPrice),
      wallet.publicKey!
    );

    const a = await createPoolTx.tx
      .buildAndExecute(undefined, {
        skipPreflight: true,
      })
      .then((res) => {
        console.log("res", res);
      });

    console.log("signature", a);
  };

  const addLiquidity = async () => {
    const whirlpoolClient = buildWhirlpoolClient(ctx);
    const usdcPublicKey = new PublicKey(
      "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
    );
    const whirlpoolPda = PDAUtil.getWhirlpool(
      ORCA_WHIRLPOOL_PROGRAM_ID,
      new PublicKey("FcrweFY1G9HJAHG5inkGB6pKg1HZ6x9UC2WioAfWrGkR"),
      usdcPublicKey,
      assetMint,
      128
    );

    const whirlpool = await whirlpoolClient.getPool(whirlpoolPda.publicKey);
    const whirlpoolData = whirlpool.getData();

    console.log("whirlpoolData", whirlpoolData.tickCurrentIndex);

    const fetcher = buildDefaultAccountFetcher(connection);

    const poolTokenAInfo = whirlpool.getTokenAInfo();
    const poolTokenBInfo = whirlpool.getTokenBInfo();

    console.log("poolTokenAInfo", poolTokenAInfo);

    // Derive the tick-indices based on a human-readable price
    const tokenADecimal = poolTokenAInfo.decimals;
    const tokenBDecimal = poolTokenBInfo.decimals;
    const tickLower = TickUtil.getInitializableTickIndex(
      PriceMath.priceToTickIndex(
        new Decimal(parseFloat(startPrice)),
        // new Decimal(0.5),
        tokenADecimal,
        tokenBDecimal
      ),
      whirlpoolData.tickSpacing
    );
    const tickUpper = TickUtil.getInitializableTickIndex(
      PriceMath.priceToTickIndex(
        new Decimal(parseFloat(endPrice)),
        tokenADecimal,
        tokenBDecimal
      ),
      whirlpoolData.tickSpacing
    );

    // Get a quote on the estimated liquidity and tokenIn (50 tokenA)
    const quote = increaseLiquidityQuoteByInputToken(
      poolTokenAInfo.mint,
      new Decimal(parseFloat(swapAmount)),
      tickLower,
      tickUpper,
      Percentage.fromFraction(1, 100),
      whirlpool
    );

    // Evaluate the quote if you need
    const { tokenMaxA, tokenMaxB } = quote;

    const initTicksTX = await whirlpool
      .initTickArrayForTicks([tickLower, tickUpper])
      .then((res) => {
        res?.buildAndExecute(undefined, {
          skipPreflight: true,
        });
      });

    // Construct the open position & increase_liquidity ix and execute the transaction.
    const { positionMint, tx } = await whirlpool.openPosition(
      tickLower,
      tickUpper,
      quote
    );
    const txId = await tx.buildAndExecute(undefined, {
      skipPreflight: true,
    });
    console.log("txId", txId);
  };

  return (
    <div>
      <Label className="text-xl font-bold">Amount in USDC</Label>
      <BorrowAmountInput
        className="mt-3"
        asset={"USDC"}
        icon={
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/1024px-Circle_USDC_Logo.svg.png"
        }
        onAmountChange={(amount) => setSwapAmount(amount)}
        value={swapAmount}
      />
      <Label className="text-xl font-bold mt-4">Range</Label>
      <br />
      <input
        className="mt-3 border border-gray-300 rounded p-1"
        placeholder="Starting price"
        onChange={(e) => setStartPrice(e.target.value)}
      />
      <input
        className="mt-3 border border-gray-300 rounded p-1"
        placeholder="Ending price"
        onChange={(e) => setEndPrice(e.target.value)}
      />
      <br />

      <Button onClick={addLiquidity} className="mt-4 bg-indigo-600">
        Add Liquidity
      </Button>
      <Button
        onClick={createPool}
        className="mt-4 bg-indigo-500 ml-2"
        disabled={parseFloat(swapAmount) != 9998}
      >
        Create Pool
      </Button>
    </div>
  );
};

export default TradeCard;
