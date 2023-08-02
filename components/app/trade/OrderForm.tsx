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

const OrderForm = () => {
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
            <PlaceOrder />
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default OrderForm;
