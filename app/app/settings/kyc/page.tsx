import KYCProcedure from "@/components/app/kyc/KYCProcedureCard";
import { Separator } from "@/components/ui/separator";
import { createSupabaseServerComponentClient } from "@/utils/supabaseServerComponentClient";

const KYCPage = async () => {
  const supabaseClient = createSupabaseServerComponentClient();
  const userData = await supabaseClient.auth.getUser();
  const { data: user, error } = await supabaseClient
    .from("users")
    .select("*")
    .eq("id", userData.data.user?.id)
    .single();

  console.log(user);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">KYC Portal</h1>
      <Separator />
      {userData.data.user?.id ? (
        <div className="mt-2">
          <KYCProcedure />
        </div>
      ) : (
        <div>
          <h1>You are not logged in, connect your wallet.</h1>
        </div>
      )}
    </div>
  );
};

export default KYCPage;
