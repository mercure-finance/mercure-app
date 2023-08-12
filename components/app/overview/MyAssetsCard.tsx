import WalletConnectButton from "@/components/general/walletadapter/WalletConnectButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database } from "@/utils/types/supabaseTypes";
import Link from "next/link";

type Token = Database["public"]["Tables"]["stocks"]["Row"];

type MyAssetsProps = {
  tokens: Token[] | null;
};

const MyAssets = ({ tokens }: MyAssetsProps) => {
  console.log("tokens from MyAssets", tokens);

  return (
    <div className="h-full">
      <Card className="mt-2">
        <CardHeader>
          <CardTitle>My Portfolio</CardTitle>
          <CardDescription>
            List of all tokenized stocks held in your wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokens!.length > 0 ? (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Icon
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Symbol
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Total Value
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Asset Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tokens &&
                    tokens.map((token) => (
                      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-slate-200">
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={token.image_url!}
                              alt={token.name}
                            />
                            <AvatarFallback>{token.symbol}</AvatarFallback>
                          </Avatar>
                        </th>

                        <td className="px-6 py-4">{token.symbol}</td>
                        <td className="px-6 py-4">1 {token.symbol}</td>
                        <td className="px-6 py-4">$234.1</td>
                        <td className="px-6 py-4 text-red-600">112.33</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <p>You don't own any tokenized stocks. </p>
              <Button className="bg-indigo-600 mt-2">
                Purchase your first stock!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAssets;
