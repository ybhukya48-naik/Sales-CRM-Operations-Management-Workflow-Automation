import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentProfile } from "@/lib/auth/session";
import { repo } from "@/lib/data/repository";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <AppShell profile={profile} demoMode={repo.isDemoMode()}>
      {children}
    </AppShell>
  );
}
