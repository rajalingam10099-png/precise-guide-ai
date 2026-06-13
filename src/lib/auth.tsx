import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";

// Anonymous sign-in bootstrap. Required so each learner has a stable
// auth.uid() for RLS. Spec defines no auth screens — anon sign-in keeps
// the experience zero-friction while still securing per-learner data.

type AuthCtx = { userId: string | null; ready: boolean };
const Ctx = createContext<AuthCtx>({ userId: null, ready: false });

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session?.user) {
        setUserId(data.session.user.id);
        setReady(true);
        return;
      }
      const { data: signedIn, error } = await supabase.auth.signInAnonymously();
      if (cancelled) return;
      if (error) {
        console.error("Anonymous sign-in failed:", error.message);
        setReady(true);
        return;
      }
      setUserId(signedIn.user?.id ?? null);
      setReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setUserId(session?.user?.id ?? null);
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <Ctx.Provider value={{ userId, ready }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
