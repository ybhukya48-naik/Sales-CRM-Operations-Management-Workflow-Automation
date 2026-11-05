import { demoLogin, supabaseLogin } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { DEMO_PROFILES } from "@/lib/data/seed";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ROLE_LABELS } from "@/lib/types";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const live = isSupabaseConfigured();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <div className="mb-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent)] text-lg font-bold text-white">
            C
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Cyond Operations Portal
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Lead CRM + 30-day nurture desk. Sign in with your role to continue.
          </p>
        </div>

        {!live ? (
          <div className="space-y-3">
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200">
              Demo mode — Supabase env vars are not set. Pick a seeded role
              below. No secrets required.
            </p>
            {DEMO_PROFILES.map((profile) => (
              <form key={profile.id} action={demoLogin.bind(null, profile.id)}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3 text-left hover:border-[var(--accent)] hover:bg-[var(--surface-2)]"
                >
                  <span>
                    <span className="block font-medium">{profile.full_name}</span>
                    <span className="text-xs text-[var(--ink-muted)]">
                      {profile.email}
                    </span>
                  </span>
                  <span className="text-xs font-medium text-[var(--accent)]">
                    {ROLE_LABELS[profile.role]}
                  </span>
                </button>
              </form>
            ))}
          </div>
        ) : (
          <form action={supabaseLogin} className="space-y-4">
            {params.error && (
              <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {params.error}
              </p>
            )}
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--ink-muted)]">Email</span>
              <input
                name="email"
                type="email"
                required
                className="rounded-md border border-[var(--border)] px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--ink-muted)]">Password</span>
              <input
                name="password"
                type="password"
                required
                className="rounded-md border border-[var(--border)] px-3 py-2"
              />
            </label>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
