import { cookies } from "next/headers";
import { mockStore } from "@/lib/data/mock-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/lib/types";
import { ROLE_PERMISSIONS } from "@/lib/types";

export const DEMO_SESSION_COOKIE = "cyond_demo_user";

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    const userId = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
    if (!userId) return null;
    return mockStore.getProfile(userId);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || !profile.is_active) {
    throw new Error("UNAUTHORIZED");
  }
  return profile;
}

export function permissionsFor(role: AppRole) {
  return ROLE_PERMISSIONS[role];
}

export function canAccessPath(role: AppRole, pathname: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (pathname.startsWith("/users")) return perms.canManageUsers;
  if (pathname.startsWith("/dashboard")) return perms.canViewDashboard;
  if (pathname.startsWith("/nurture") || pathname.startsWith("/tasks")) {
    return perms.canSendNurture || perms.canViewDashboard;
  }
  if (pathname.startsWith("/pipeline") || pathname.startsWith("/prospects")) {
    return perms.canViewPipeline;
  }
  return true;
}
