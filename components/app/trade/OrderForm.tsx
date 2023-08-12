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
import { useState } from "react";

const OrderForm = () => {
  const provider = useSolanaProvider();
  const wallet = useAnchorWallet();

  interface Amounts {
    purchaseAmount: number | undefined;
    sellAmount: number | undefined;
    purchasePrice: string | undefined;
    sellPrice: string | undefined;
  }

  const [amounts, setAmounts] = useState<Amounts>({
    purchaseAmount: undefined,
    sellAmount: undefined,
    purchasePrice: undefined,
    sellPrice: undefined,
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
    const inputValue = e.target.value;
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
                      TSLA
                    </button>
                    <input
                      placeholder="0"
                      className="h-full w-full bg-transparent disabled:cursor-not-allowed disabled:opacity-100 disabled:text-black dark:text-white text-right font-semibold dark:placeholder:text-white/25 text-base md:text-xl outline-none"
                      onChange={(e) => handleChange(e, "buy")}
                      value={amounts.purchaseAmount}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-1 ">
              <Label htmlFor="username">Buy TSLA at rate</Label>
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
                      value={amounts.purchasePrice}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Separator orientation="horizontal" className="" />
            <div className="space-y-1 mb-2">
              <Label htmlFor="username">You're buying</Label>
              <div className="p-4 h-[72px] border-slate-400 border relative dark:bg-v2-background-dark rounded-md flex flex-col space-y-3 group focus-within:border-v2-primary/50 focus-within:shadow-swap-input-dark">
                <div className="flex">
                  <div className="flex justify-between items-center group/select">
                    <button className="py-2 px-3 h-10 rounded-xl flex space-x-3 items-center bg-white dark:bg-v2-background border dark:group-hover/select:border-v2-primary/50 dark:group-hover/select:bg-[rgba(199,242,132,0.2)] dark:group-hover/select:shadow-swap-input-dark border-transparent">
                      USDC
                    </button>
                    <input
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
                      TSLA
                    </button>
                    <input
                      placeholder="0"
                      className="h-full w-full bg-transparent disabled:cursor-not-allowed disabled:opacity-100 disabled:text-black dark:text-white text-right font-semibold dark:placeholder:text-white/25 text-base md:text-xl outline-none"
                      onChange={(e) => handleChange(e, "sell")}
                      value={amounts.sellAmount}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-1 ">
              <Label htmlFor="username">Buy TSLA at rate</Label>
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
                      value={amounts.sellPrice}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Separator orientation="horizontal" className="" />
            <div className="space-y-1 mb-2">
              <Label htmlFor="username">You're buying</Label>
              <div className="p-4 h-[72px] border-slate-400 border relative dark:bg-v2-background-dark rounded-md flex flex-col space-y-3 group focus-within:border-v2-primary/50 focus-within:shadow-swap-input-dark">
                <div className="flex">
                  <div className="flex justify-between items-center group/select">
                    <button className="py-2 px-3 h-10 rounded-xl flex space-x-3 items-center bg-white dark:bg-v2-background border dark:group-hover/select:border-v2-primary/50 dark:group-hover/select:bg-[rgba(199,242,132,0.2)] dark:group-hover/select:shadow-swap-input-dark border-transparent">
                      USDC
                    </button>
                    <input
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
