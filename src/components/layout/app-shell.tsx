import Link from "next/link";
import { logout } from "@/app/actions/auth";
import type { Profile } from "@/lib/types";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "@/lib/types";
import { RoleBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/pipeline", label: "Pipeline", key: "pipeline" as const },
  { href: "/tasks", label: "Daily tasks", key: "tasks" as const },
  { href: "/nurture", label: "Nurture", key: "nurture" as const },
  { href: "/dashboard", label: "Dashboard", key: "dashboard" as const },
  { href: "/users", label: "Users", key: "users" as const },
];

export function AppShell({
  profile,
  demoMode,
  children,
}: {
  profile: Profile;
  demoMode: boolean;
  children: React.ReactNode;
}) {
  const perms = ROLE_PERMISSIONS[profile.role];
  const links = NAV.filter((item) => {
    if (item.key === "users") return perms.canManageUsers;
    if (item.key === "dashboard") return perms.canViewDashboard;
    if (item.key === "tasks" || item.key === "nurture") {
      return perms.canSendNurture || perms.canViewDashboard;
    }
    return perms.canViewPipeline;
  });

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/pipeline" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-sm font-bold text-white">
                C
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">
                  Cyond Operations
                </div>
                <div className="text-[11px] text-[var(--ink-muted)]">
                  Lead CRM · Nurture desk
                </div>
              </div>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-1.5 text-sm text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {demoMode && (
              <span className="hidden rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200 sm:inline">
                Demo mode
              </span>
            )}
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium">{profile.full_name}</div>
              <div className="text-[11px] text-[var(--ink-muted)]">
                {ROLE_LABELS[profile.role]}
              </div>
            </div>
            <RoleBadge role={profile.role} />
            <form action={logout}>
              <Button type="submit" variant="ghost" className="text-xs">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-[var(--border)] px-4 py-2 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-[var(--ink-muted)] hover:bg-[var(--surface-2)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
