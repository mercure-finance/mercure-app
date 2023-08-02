import {
  createPagesBrowserClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { Database } from "./types/supabaseTypes";

export const supabaseClient = createPagesBrowserClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL! as string,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! as string,
});
