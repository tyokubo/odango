import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

export function useRequireAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setUser(null);
        setLoading(false);
        router.replace("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return {
    user,
    loading,
  };
}
