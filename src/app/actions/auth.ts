"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_SESSION_COOKIE } from "@/lib/auth/session";
import { DEMO_PROFILES } from "@/lib/data/seed";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function demoLogin(userId: string) {
  const profile = DEMO_PROFILES.find((p) => p.id === userId);
  if (!profile) {
    throw new Error("Unknown demo user");
  }
  const cookieStore = await cookies();
  cookieStore.set(DEMO_SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  redirect("/pipeline");
}

export async function demoLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_SESSION_COOKIE);
  redirect("/login");
}

export async function supabaseLogin(formData: FormData) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/pipeline");
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  await demoLogout();
}
