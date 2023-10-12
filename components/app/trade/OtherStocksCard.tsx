import * as React from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createSupabaseServerComponentClient } from "@/utils/supabaseServerComponentClient";
import { Database } from "@/utils/types/supabaseTypes";

type Stock = Database["public"]["Tables"]["stocks"]["Row"];

interface OtherStocksProps {
  stocks: Stock[] | null;
}

const OtherStocks = ({ stocks }: OtherStocksProps) => {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Trending Assets</CardTitle>
        <CardDescription>
          These assets are extremely popular on our platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {stocks &&
            stocks.map((stock) => (
              <div className="flex items-center" key={stock.symbol}>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={stock.image_url!} alt={stock.name} />
                  <AvatarFallback>{stock.symbol}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {stock.symbol}
                  </p>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                </div>
                <a
                  className="ml-auto font-medium text-indigo-600"
                  href={`/app/borrow/${stock.symbol}`}
                >
                  Borrow
                </a>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OtherStocks;
