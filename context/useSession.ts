import { RealtimeChannel, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/utils/supabaseClient";
import { useWallet } from "@solana/wallet-adapter-react";

export interface UserProfile {
  name: string | null;
  kyc: boolean;
  wallet_address: string;
}

export interface SessionUserInfo {
  session: Session | null;
  profile: UserProfile | null;
  loadingProfile: boolean;
}

export function useSession(): SessionUserInfo {
  const [userInfo, setUserInfo] = useState<SessionUserInfo>({
    profile: null,
    session: null,
    loadingProfile: true,
  });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUserInfo({ ...userInfo, session });
      supabaseClient.auth.onAuthStateChange((_event, session) => {
        setUserInfo({ session, profile: null, loadingProfile: true });
      });
    });
  }, []);

  useEffect(() => {
    if (userInfo.session?.user && !userInfo.profile) {
      listenToUserProfileChanges(userInfo.session.user.id).then(
        (newChannel) => {
          if (channel) {
            channel.unsubscribe();
          }
          setChannel(newChannel);
        }
      );
    } else if (!userInfo.session?.user) {
      channel?.unsubscribe();
      setChannel(null);
    }
  }, [userInfo.session]);

  async function listenToUserProfileChanges(userId: string) {
    const { data } = await supabaseClient
      .from("users")
      .select("*")
      .filter("id", "eq", userId);

    if (data?.[0]) {
      setUserInfo({ ...userInfo, profile: data?.[0], loadingProfile: false });
    } else {
      setUserInfo({ ...userInfo, loadingProfile: false });
    }
    return supabaseClient
      .channel(`public:users`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setUserInfo({ ...userInfo, profile: payload.new as UserProfile });
        }
      )
      .subscribe();
  }

  return userInfo;
}
