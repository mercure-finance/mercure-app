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
  assets: Asset[];
  onAssetChange?: (asset: string) => void;
  tokenSymbol: string;
  onAmountChange?: (amount: string) => void;
  tokenImage: string;
}

const CryptoSwapInput = React.forwardRef<
  HTMLInputElement,
  CryptoSwapInputProps
>(
  (
    { className, assets, onAssetChange, onAmountChange, tokenImage, ...props },
    ref
  ) => {
    const [searchTerm, setSearchTerm] = useState("");
    const filteredAssets = assets.filter(
      (token) =>
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
                <Image src={tokenImage} alt="Solana" width={32} height={32} />
                <h2 className="font-bold ml-2">{props.tokenSymbol}</h2>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="end">
              <input
                type="text"
                placeholder="Search collateral token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2"
              />
              <div className="border border-gray-200 max-h-48 overflow-y-auto">
                {filteredAssets.length === 0 ? (
                  <div className="px-4 py-2">No assets found.</div>
                ) : (
                  filteredAssets.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => {
                        if (onAssetChange) onAssetChange(token.symbol); // Invoke the callback
                        setSearchTerm(""); // Clear the search term
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      {token.name}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <input
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
  }
);
CryptoSwapInput.displayName = "CryptoSwapInput";

export { CryptoSwapInput };
