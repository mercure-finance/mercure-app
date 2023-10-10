import { BorrowAmountInput } from "@/components/app/borrow/BorrowAmountInput";
import { OrderHistory } from "@/components/app/overview/OrderHistoryCard";
import OrderForm from "@/components/app/trade/OrderForm";
import OtherStocks from "@/components/app/trade/OtherStocksCard";
import { supabaseClient } from "@/utils/supabaseClient";
import {
  ORCA_WHIRLPOOL_PROGRAM_ID,
  PDAUtil,
  buildWhirlpoolClient,
  swapQuoteByInputToken,
  ORCA_WHIRLPOOLS_CONFIG,
  WhirlpoolContext,
  buildDefaultAccountFetcher,
} from "@orca-so/whirlpools-sdk";
import { Percentage } from "@orca-so/common-sdk/";
import * as anchor from "@coral-xyz/anchor";
import { Decimal } from "decimal.js";

import { Button } from "@solana/wallet-adapter-react-ui/lib/types/Button";
import { PublicKey } from "@solana/web3.js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Input } from "postcss";
import { useEffect, useState } from "react";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import TradeCard from "@/components/app/trade/TradeCard";

type BuyOrSell = "buy" | "sell";

export const revalidate = 10;

const StockTradePage = async ({
  params,
}: {
  params: { order: BuyOrSell; stock: string };
}) => {
  const { data: stock, error: fetchStockError } = await supabaseClient
    .from("stocks")
    .select("*")
    .eq("symbol", params.stock)
    .single();

  if (!stock) {
    // throw 404
    notFound();
  }
  const { data: trendingStocks, error: trendingStocksError } =
    await supabaseClient.from("stocks").select("*");

  console.log("STOCK ADDRESS", stock.address);
  console.log("stock");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Trade</h1>
      <div className="grid grid-cols-1 md:grid-cols-9">
        <div className="w-full md:col-span-5">
          <TradeCard
            stockSymbol={stock.symbol!}
            stockAddress={stock.address!}
            stockImage={stock.image_url!}
          />
        </div>
        <div className="w-full md:ml-2 mt-2 md:mt-0 col-span-4">
          <OtherStocks stocks={trendingStocks} />
        </div>
      </div>
    </div>
  );
};

export default StockTradePage;
