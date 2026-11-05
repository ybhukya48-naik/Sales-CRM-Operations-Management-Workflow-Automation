import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured — use demo mode.");
  }
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
