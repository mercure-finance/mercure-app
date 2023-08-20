import { OrderHistory } from "@/components/app/overview/OrderHistoryCard";
import OrderForm from "@/components/app/trade/OrderForm";
import OtherStocks from "@/components/app/trade/OtherStocksCard";
import { supabaseClient } from "@/utils/supabaseClient";

import { Button } from "@solana/wallet-adapter-react-ui/lib/types/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Input } from "postcss";

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Trade</h1>
      <div className="grid grid-cols-1 md:grid-cols-9">
        <div className="w-full md:col-span-5">
          <OrderForm stock={params.stock} />
        </div>
        <div className="w-full md:ml-2 mt-2 md:mt-0 col-span-4">
          <OtherStocks stocks={trendingStocks} />
        </div>
      </div>
      <div className="w-full">
        <OrderHistory stocks={params.stock} />
      </div>
    </div>
  );
};

export default StockTradePage;
