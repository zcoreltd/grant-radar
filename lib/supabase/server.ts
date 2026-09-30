import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return { publishableKey, url };
}

export async function createClient() {
  const cookieStore = await cookies();
  const { publishableKey, url } = getSupabaseConfig();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies; middleware handles refreshes.
        }
      },
    },
  });
}

export async function checkConnection(): Promise<boolean> {
  const { publishableKey, url } = getSupabaseConfig();
  const response = await fetch(new URL("/auth/v1/settings", url), {
    cache: "no-store",
    headers: {
      apikey: publishableKey,
    },
    signal: AbortSignal.timeout(5_000),
  });

  return response.ok;
}
