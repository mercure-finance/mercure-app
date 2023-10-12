import BorrowForm from "@/components/app/borrow/BorrowForm";
import { OrderHistory } from "@/components/app/overview/OrderHistoryCard";
import OrderForm from "@/components/app/trade/OrderForm";
import OtherStocks from "@/components/app/trade/OtherStocksCard";
import { supabaseClient } from "@/utils/supabaseClient";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Input } from "postcss";

type BuyOrSell = "buy" | "sell";

export const revalidate = 10;

const StockTradePage = async ({ params }: { params: { asset: string } }) => {
  const { data: stock, error: fetchStockError } = await supabaseClient
    .from("stocks")
    .select("*")
    .eq("symbol", params.asset)
    .single();

  if (!stock) {
    // throw 404
    notFound();
  }
  const { data: trendingStocks, error: trendingStocksError } =
    await supabaseClient.from("stocks").select("*");
  // @ts-ignore
  console.log(stock.price_feed_id);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Borrow ${params.asset}</h1>
      <p className="text-muted-foreground mb-3">
        Create a debt position referenced to the {stock.name} price.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-9">
        <div className="w-full md:col-span-5">
          <BorrowForm
            stock_symbol={stock.symbol}
            // @ts-ignore
            feed_id={stock.price_feed_id}
            // @ts-ignore
            feed_address={stock.price_feed_address}
            stock_image={stock.image_url!}
            // @ts-ignore
            stock_inversed={stock.inversed}
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
