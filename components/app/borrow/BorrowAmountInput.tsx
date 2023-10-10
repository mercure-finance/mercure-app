"use client";
import * as React from "react";
import { cn } from "@/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import { ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Asset } from "./BorrowForm";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface CryptoSwapInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  asset: string;
  onAmountChange?: (amount: string) => void;
  icon: string;
}

const BorrowAmountInput = React.forwardRef<
  HTMLInputElement,
  CryptoSwapInputProps
>(({ className, asset, icon, onAmountChange, ...props }, ref) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <div className="">
        <div className=" max-h-48 overflow-y-auto">
          <Image src={icon} alt="Solana" width={40} height={40} />
        </div>
      </div>
      <input
        type="text"
        ref={ref}
        {...props}
        value={props.value === 0 ? "" : props.value}
        onChange={(e) => {
          if (onAmountChange) {
            onAmountChange(e.target.value);
          }
        }}
        className="text-right focus:outline-none placeholder:text-xl placeholder:font-semibold font-bold text-xl w-full"
        placeholder="0.00"
      />
    </div>
  );
});
BorrowAmountInput.displayName = "BorrowAmountInput";

export { BorrowAmountInput };
