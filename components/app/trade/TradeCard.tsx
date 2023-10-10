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
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface TradeCardProps {
  stockAddress: string;
  stockImage: string;
  stockSymbol: string;
}

const TradeCard = ({
  stockAddress,
  stockImage,
  stockSymbol,
}: TradeCardProps) => {
  const [swapAmount, setSwapAmount] = useState("");
  const [estimatedOutput, setEstimatedOutput] = useState(null);
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const assetMint = new PublicKey(stockAddress);
  const [loading, setLoading] = useState(false);

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

  const fetchEstimatedOutput = async () => {
    const whirlpoolClient = buildWhirlpoolClient(ctx);
    const desiredMarketPrice = new Decimal(1.05);
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
    /*
    const createPoolTx = await whirlpoolClient.createPool(
      new PublicKey("FcrweFY1G9HJAHG5inkGB6pKg1HZ6x9UC2WioAfWrGkR"),
      usdcPublicKey,
      assetMint,
      128,
      0,
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
    */
    // pause by timing out for 5 seconds

    const whirlpool = await whirlpoolClient.getPool(whirlpoolPda.publicKey);
    const whirlpoolData = whirlpool.getData();

    console.log("whirlpoolData", whirlpoolData.tickCurrentIndex);

    const fetcher = buildDefaultAccountFetcher(connection);
    /*
    const poolTokenAInfo = whirlpool.getTokenAInfo();
    const poolTokenBInfo = whirlpool.getTokenBInfo();

    console.log("poolTokenAInfo", poolTokenAInfo);

    // Derive the tick-indices based on a human-readable price
    const tokenADecimal = poolTokenAInfo.decimals;
    const tokenBDecimal = poolTokenBInfo.decimals;
    */
    /*
    const tickLower = TickUtil.getInitializableTickIndex(
      
      PriceMath.priceToTickIndex(
        new Decimal(0),
        // new Decimal(0.5),
        tokenADecimal,
        tokenBDecimal
      ),
      
      -128,
      whirlpoolData.tickSpacing
    );
    
    const tickUpper = TickUtil.getInitializableTickIndex(
      PriceMath.priceToTickIndex(new Decimal(5), tokenADecimal, tokenBDecimal),
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
    */

    /*
    const initTicksTX = await whirlpool
      .initTickArrayForTicks([tickLower, tickUpper])
      .then((res) => {
        res?.buildAndExecute(undefined, {
          skipPreflight: true,
        });
      });
      */

    // Construct the open position & increase_liquidity ix and execute the transaction.
    /*
    const { positionMint, tx } = await whirlpool.openPosition(
      tickLower,
      tickUpper,
      quote
    );
    const txId = await tx.buildAndExecute(undefined, {
      skipPreflight: true,
    });
    */

    const inputTokenQuote = await swapQuoteByInputToken(
      whirlpool,
      usdcPublicKey,
      DecimalUtil.toBN(new Decimal(parseFloat(swapAmount) * 10 ** 6)),
      Percentage.fromFraction(1, 2), // 0.1%
      ctx.program.programId,
      fetcher
    );
    console.log("inputTokenQuote", inputTokenQuote.estimatedAmountOut);
    setEstimatedOutput(inputTokenQuote.estimatedAmountOut);
  };

  const executeSwap = async () => {
    setLoading(true);
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
    const fetcher = buildDefaultAccountFetcher(connection);

    const whirlpool = await whirlpoolClient.getPool(whirlpoolPda.publicKey);
    const whirlpoolData = whirlpool.getData();
    const inputTokenQuote = await swapQuoteByInputToken(
      whirlpool,
      usdcPublicKey,
      DecimalUtil.toBN(new Decimal(parseFloat(swapAmount) * 10 ** 6)),
      Percentage.fromFraction(1, 2), // 0.1%
      ctx.program.programId,
      fetcher
    );
    setLoading(false);

    const signature = await whirlpool.swap(inputTokenQuote).then((res) => {
      res.buildAndExecute(undefined, {
        skipPreflight: true,
      });
    });

    console.log("signature", signature);
  };

  useEffect(() => {
    if (swapAmount) {
      fetchEstimatedOutput();
    }
  }, [swapAmount]);
  return (
    <div>
      <h2>Swap amount in USDC:</h2>
      <BorrowAmountInput
        className="mt-3"
        asset={"USDC"}
        icon={
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/1024px-Circle_USDC_Logo.svg.png"
        }
        onAmountChange={(amount) => setSwapAmount(amount)}
        value={swapAmount}
      />
      {estimatedOutput && (
        <div className="mt-2">
          <h2>You will receive:</h2>
          <div className="flex mt-2">
            <Image
              src={stockImage}
              alt="Image"
              width={40}
              height={40}
              className="mr-2"
            />
            <p className="font-bold text-large">
              {Number(estimatedOutput / 10 ** 9)} {stockSymbol}
            </p>
          </div>
          <Button className="mt-4 bg-indigo-600" onClick={executeSwap}>
            {loading ? "Loading.." : "Swap"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TradeCard;
