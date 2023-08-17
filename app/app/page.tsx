import AffiliateProgram from "@/components/app/overview/AffiliateProgramCard";
import LearnMore from "@/components/app/overview/LearnMoreCard";
import MyAssets from "@/components/app/overview/MyAssetsCard";
import { OrderHistory } from "@/components/app/overview/OrderHistoryCard";
import TotalValue from "@/components/app/overview/TotalValueCard";
import { createSupabaseServerComponentClient } from "@/utils/supabaseServerComponentClient";
import { Database } from "@/utils/types/supabaseTypes";
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");

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

      console.log(profile.wallet_address);

      const heliusKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY! as string;
      const url = `https://api.helius.xyz/v0/addresses/${profile.wallet_address}/balances?api-key=${heliusKey}`;

      const data = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(profile.wallet_address),
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
        }
      );

      let tokens = new Set<string>(
        data.value.map((item) => item.account.data.parsed.info.mint)
      );
      console.log("TOKEN HELD LIST", tokens);
      const filteredList = stocks!.filter((stock) =>
        tokens.has(stock.address!)
      );
      console.log(stocks);
      console.log("FILTERED LIST", filteredList);

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
        <div className="col-span-1 md:col-span-3 md:ml-3">
          <LearnMore />
          <AffiliateProgram />
        </div>
      </div>
      <div className="w-full">
        <OrderHistory stocks={null} />
      </div>
    </div>
  );
};

export default OverviewPage;
