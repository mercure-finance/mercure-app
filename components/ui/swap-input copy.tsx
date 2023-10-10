import * as React from "react";
import { cn } from "@/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Button } from "./button";
import { ChevronDownIcon } from "lucide-react";
import { PopoverClose } from "@radix-ui/react-popover";
import Image from "next/image";

export interface CryptoSwapInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  assets: string[];
  onAssetChange?: (asset: string) => void;
  tokenName: string;
}

const allTokens = ["USDC", "USDT", "DAI", "ETH"];

const CryptoSwapInput = React.forwardRef<
  HTMLInputElement,
  CryptoSwapInputProps
>(({ className, assets, onAssetChange, ...props }, ref) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <div className="">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="ml-auto bg-slate-100">
              <Image
                src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
                alt="Image"
                width={30}
                height={30}
                className="mr-2"
              />
              <h2 className="font-bold">{props.tokenName} </h2>
              <ChevronDownIcon className="ml-2 h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="end">
            <Command
              onValueChange={(value) => console.log("value is", value)}
              value="USDC"
            >
              <CommandInput placeholder="Select collateral token..." />
              <CommandList>
                <CommandEmpty>No assets found.</CommandEmpty>
                <CommandGroup>
                  {allTokens.map((token) => (
                    <PopoverClose key={token}>
                      <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                        <p>{token}</p>
                        <p className="text-sm text-muted-foreground text-start">
                          Can view, comment and manage billing.
                        </p>
                      </CommandItem>
                    </PopoverClose>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <input
        ref={ref}
        {...props}
        className="text-right focus:outline-none placeholder:text-xl placeholder:font-semibold font-bold text-xl w-full"
        placeholder="0.00"
      />
    </div>
  );
});
CryptoSwapInput.displayName = "CryptoSwapInput";

export { CryptoSwapInput };
