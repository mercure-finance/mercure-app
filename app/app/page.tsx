import AffiliateProgram from "@/components/app/overview/AffiliateProgramCard";
import LearnMore from "@/components/app/overview/LearnMoreCard";
import MyAssets from "@/components/app/overview/MyAssetsCard";
import TotalValue from "@/components/app/overview/TotalValueCard";
import WalletConnectButton from "@/components/general/walletadapter/WalletConnectButton";
import { createSupabaseServerComponentClient } from "@/utils/supabaseServerComponentClient";
import { Database } from "@/utils/types/supabaseTypes";
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");

type Token = Database["public"]["Tables"]["stocks"]["Row"];

const OverviewPage = async () => {
  const supabase = createSupabaseServerComponentClient();
  const session = await supabase.auth.getSession();

  let tokens: Token[] | null = null; // set initial value to null

  if (session.data.session?.user) {
    const { data: profile, error: fetchProfileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.data.session.user.id)
      .single();

    const { data: stocks, error: fetchStocksError } = await supabase
      .from("stocks")
      .select("*");

    let addresses = new Set(stocks?.map((item) => item.address));

    const getBalances = async () => {
      if (!profile?.wallet_address) {
        return null;
      }

      const heliusKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY! as string;
      const url = `https://api.helius.xyz/v0/addresses/${profile.wallet_address}/balances?api-key=${heliusKey}`;
      const response = await fetch(url);
      const data = await response.json();
      let tokens = new Set<string>(
        data.tokens?.map((item: { mint: string }) => item.mint)
      );
      const filteredList = stocks!.filter((stock) =>
        tokens.has(stock.address!)
      );

      return filteredList;
    };

    tokens = await getBalances();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Home</h1>
      <div className="grid grid-cols-1 md:grid-cols-9">
        <div className="col-span-1 md:col-span-6">
          <TotalValue />
          <MyAssets tokens={tokens ?? []} />
        </div>
        <div className="col-span-1 md:col-span-3 ml-3">
          <LearnMore />
          <AffiliateProgram />
        </div>
        <div className="w-full"></div>
      </div>
    </div>
  );
};

export default OverviewPage;
