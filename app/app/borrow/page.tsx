import { AllassetsCard } from "@/components/general/AllAssetsCard";
import { supabaseClient } from "@/utils/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const revalidate = 10;

const TradePage = async () => {
  const { data: stocks, error } = await supabaseClient
    .from("stocks")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="">
      <h1 className="text-3xl font-bold tracking-tight">Borrow</h1>
      <p className="text-muted-foreground mt-1">
        List of real world asset prices for which a debt position can be
        created.
      </p>
      <AllassetsCard />
    </div>
  );
};

export default TradePage;
