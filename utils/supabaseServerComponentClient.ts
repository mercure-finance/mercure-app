import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { Database } from "./types/supabaseTypes";

export const createSupabaseServerComponentClient = cache(() => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
});
