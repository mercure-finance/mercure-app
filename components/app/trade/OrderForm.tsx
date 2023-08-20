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
import PlaceOrder from "./PlaceOrderButton";
import { useSolanaProvider } from "@/utils/solanaProvider";
import * as anchor from "@coral-xyz/anchor";
import idl from "@/utils/idl/ousia_burn_and_mint.json";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { OusiaBurnAndMint } from "@/utils/idl/ousia-burn-and-mint";
import { useEffect, useState } from "react";

interface OrderFormProps {
  stock: string;
}

const OrderForm = ({ stock }: OrderFormProps) => {
  const provider = useSolanaProvider();
  const wallet = useAnchorWallet();
  const [currentStockPrice, setCurrentStockPrice] = useState<number>();

  interface Amounts {
    purchaseAmount: number | undefined;
    sellAmount: number | undefined;
    purchasePrice: string | undefined;
    sellPrice: string | undefined;
  }

  const [amounts, setAmounts] = useState<Amounts>({
    purchaseAmount: 0,
    sellAmount: 0,
    purchasePrice: "0",
    sellPrice: "0",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "buy" | "sell"
  ) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      setAmounts({
        ...amounts,
        purchaseAmount: undefined,
        sellAmount: undefined,
      });
      return;
    }

    if (type === "buy") {
      if (!/\./.test(inputValue)) {
        setAmounts({
          ...amounts,
          purchaseAmount: parseFloat(inputValue),
        });
      }
    } else if (type === "sell") {
      if (!/\./.test(inputValue)) {
        setAmounts({
          ...amounts,
          sellAmount: parseFloat(inputValue),
        });
      }
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Convert commas to dots
    inputValue = inputValue.replace(/,/g, ".");

    if (inputValue === "") {
      setAmounts({
        ...amounts,
        purchasePrice: undefined,
        sellPrice: undefined,
      });
      return;
    }

    setAmounts({
      ...amounts,
      purchasePrice: inputValue,
      sellPrice: inputValue,
    });
  };

  useEffect(() => {
    const fetchStockPrice = async () => {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/quote/${stock}?apikey=5a42405748c14ba82ed54f948f455c94`
      );
      const data = await response.json();
      console.log(data);
      setCurrentStockPrice(data[0].price);
    };
    fetchStockPrice();
  }, []);

  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account" className="text-white bg-green-600/30">
          Buy
        </TabsTrigger>
        <TabsTrigger value="password" className="text-white bg-red-600/30">
          Sell
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardContent className="space-y-2 mt-3">
            <div className="space-y-1">
              <Label htmlFor="name">Purchase</Label>
              <div className="p-4 h-[72px] border-slate-400 border relative dark:bg-v2-background-dark rounded-md flex flex-col space-y-3 group focus-within:border-v2-primary/50 focus-within:shadow-swap-input-dark">
                <div className="flex">
                  <div className="flex justify-between items-center group/select">
                    <button className="py-2 px-3 h-10 rounded-xl flex space-x-3 items-center bg-white dark:bg-v2-background border dark:group-hover/select:border-v2-primary/50 dark:group-hover/select:bg-[rgba(199,242,132,0.2)] dark:group-hover/select:shadow-swap-input-dark border-transparent">
                      {stock}
                    </button>
                    <input
                      placeholder="0"
                      className="h-full w-full bg-transparent disabled:cursor-not-allowed disabled:opacity-100 disabled:text-black dark:text-white text-right font-semibold dark:placeholder:text-white/25 text-base md:text-xl outline-none"
                      onChange={(e) => handleChange(e, "buy")}
                      value={
                        amounts.purchaseAmount !== 0
                          ? amounts.purchaseAmount
                          : ""
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-1 ">
              <div className="flex justify-between">
                <Label htmlFor="username">Buy {stock} at rate</Label>
                <button
                  className="bg-indigo-600 text-sm p-1 text-white"
                  onClick={() =>
                    setAmounts({
                      ...amounts,
                      purchasePrice: currentStockPrice?.toString(),
                    })
                  }
                >
                  Use market price
                </button>
              </div>
              <div className="p-4 h-[72px] border-slate-400 border relative dark:bg-v2-background-dark rounded-md flex flex-col space-y-3 group focus-within:border-v2-primary/50 focus-within:shadow-swap-input-dark">
                <div className="flex">
                  <div className="flex justify-between items-center group/select">
                    <button className="py-2 px-3 h-10 rounded-xl flex space-x-3 items-center bg-white dark:bg-v2-background border dark:group-hover/select:border-v2-primary/50 dark:group-hover/select:bg-[rgba(199,242,132,0.2)] dark:group-hover/select:shadow-swap-input-dark border-transparent">
                      USDC
                    </button>
                    <input
                      placeholder="0.00"
                      className="h-full w-full bg-transparent disabled:cursor-not-allowed disabled:opacity-100 disabled:text-black dark:text-white text-right font-semibold dark:placeholder:text-white/25 text-base md:text-xl outline-none"
                      onChange={(e) => handlePriceChange(e)}
                      value={
                        amounts.purchasePrice !== "0"
                          ? amounts.purchasePrice
                          : ""
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <Separator orientation="horizontal" className="" />
            <div className="space-y-1 mb-2">
              <Label htmlFor="username">You are paying</Label>
              <div className="p-4 h-[72px] border-slate-400 border relative dark:bg-v2-background-dark rounded-md flex flex-col space-y-3 group focus-within:border-v2-primary/50 focus-within:shadow-swap-input-dark">
                <div className="flex">
                  <div className="flex justify-between items-center group/select">
                    <button className="py-2 px-3 h-10 rounded-xl flex space-x-3 items-center bg-white dark:bg-v2-background border dark:group-hover/select:border-v2-primary/50 dark:group-hover/select:bg-[rgba(199,242,132,0.2)] dark:group-hover/select:shadow-swap-input-dark border-transparent">
                      USDC
                    </button>
                    <input
                      value={
                        (amounts.purchaseAmount ? amounts.purchaseAmount : 0) *
                          Number(amounts.purchasePrice) ?? 0
                      }
                      disabled
                      placeholder="0.00"
                      className="h-full w-full bg-transparent disabled:cursor-not-allowed disabled:opacity-100 disabled:text-black dark:text-white text-right font-semibold dark:placeholder:text-white/25 text-base md:text-xl outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <PlaceOrder
              orderType="buy"
              amounts={{
                amount: amounts.purchaseAmount,
                price: amounts.purchasePrice,
              }}
            />
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardContent className="space-y-2 mt-3">
            <div className="space-y-1">
              <Label htmlFor="name">Sell</Label>
              <div className="p-4 h-[72px] border-slate-400 border relative dark:bg-v2-background-dark rounded-md flex flex-col space-y-3 group focus-within:border-v2-primary/50 focus-within:shadow-swap-input-dark">
                <div className="flex">
                  <div className="flex justify-between items-center group/select">
                    <button className="py-2 px-3 h-10 rounded-xl flex space-x-3 items-center bg-white dark:bg-v2-background border dark:group-hover/select:border-v2-primary/50 dark:group-hover/select:bg-[rgba(199,242,132,0.2)] dark:group-hover/select:shadow-swap-input-dark border-transparent">
                      {stock}
                    </button>
                    <input
                      placeholder="0"
                      className="h-full w-full bg-transparent disabled:cursor-not-allowed disabled:opacity-100 disabled:text-black dark:text-white text-right font-semibold dark:placeholder:text-white/25 text-base md:text-xl outline-none"
                      onChange={(e) => handleChange(e, "sell")}
                      value={amounts.sellAmount !== 0 ? amounts.sellAmount : ""}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-1 ">
              <div className="flex justify-between">
                <Label htmlFor="username">Buy {stock} at rate</Label>
                <button
                  className="bg-indigo-600 text-sm p-1 text-white"
                  onClick={() =>
                    setAmounts({
                      ...amounts,
                      sellPrice: currentStockPrice?.toString(),
                    })
                  }
                >
                  Use market price
                </button>
              </div>
              <div className="p-4 h-[72px] border-slate-400 border relative dark:bg-v2-background-dark rounded-md flex flex-col space-y-3 group focus-within:border-v2-primary/50 focus-within:shadow-swap-input-dark">
                <div className="flex">
                  <div className="flex justify-between items-center group/select">
                    <button className="py-2 px-3 h-10 rounded-xl flex space-x-3 items-center bg-white dark:bg-v2-background border dark:group-hover/select:border-v2-primary/50 dark:group-hover/select:bg-[rgba(199,242,132,0.2)] dark:group-hover/select:shadow-swap-input-dark border-transparent">
                      USDC
                    </button>
                    <input
                      placeholder="0.00"
                      className="h-full w-full bg-transparent disabled:cursor-not-allowed disabled:opacity-100 disabled:text-black dark:text-white text-right font-semibold dark:placeholder:text-white/25 text-base md:text-xl outline-none"
                      onChange={(e) => handlePriceChange(e)}
                      value={amounts.sellPrice !== "0" ? amounts.sellPrice : ""}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Separator orientation="horizontal" className="" />
            <div className="space-y-1 mb-2">
              <Label htmlFor="username">You will receive</Label>
              <div className="p-4 h-[72px] border-slate-400 border relative dark:bg-v2-background-dark rounded-md flex flex-col space-y-3 group focus-within:border-v2-primary/50 focus-within:shadow-swap-input-dark">
                <div className="flex">
                  <div className="flex justify-between items-center group/select">
                    <button className="py-2 px-3 h-10 rounded-xl flex space-x-3 items-center bg-white dark:bg-v2-background border dark:group-hover/select:border-v2-primary/50 dark:group-hover/select:bg-[rgba(199,242,132,0.2)] dark:group-hover/select:shadow-swap-input-dark border-transparent">
                      USDC
                    </button>
                    <input
                      value={
                        amounts.sellAmount
                          ? amounts.sellAmount
                          : 0 * Number(amounts.sellPrice)
                      }
                      disabled
                      placeholder="0.00"
                      className="h-full w-full bg-transparent disabled:cursor-not-allowed disabled:opacity-100 disabled:text-black dark:text-white text-right font-semibold dark:placeholder:text-white/25 text-base md:text-xl outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <PlaceOrder
              orderType="sell"
              amounts={{
                amount: amounts.purchaseAmount,
                price: amounts.purchasePrice,
              }}
            />
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default OrderForm;
