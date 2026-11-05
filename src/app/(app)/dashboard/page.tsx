import { redirect } from "next/navigation";
import { MetricsPanel } from "@/components/dashboard/metrics-panel";
import { getCurrentProfile } from "@/lib/auth/session";
import { repo } from "@/lib/data/repository";
import { ROLE_PERMISSIONS } from "@/lib/types";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!ROLE_PERMISSIONS[profile.role].canViewDashboard) {
    redirect("/pipeline");
  }

  const [metrics, activity] = await Promise.all([
    repo.getDashboardMetrics(),
    repo.listActivity(12),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Management dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Funnel counts, nurture due/overdue, and conversion by lead source.
        </p>
      </div>

      <MetricsPanel metrics={metrics} />

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="mb-4 text-sm font-semibold">Recent activity</h2>
        <ul className="space-y-2">
          {activity.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)]/60 py-2 text-sm last:border-0"
            >
              <span>
                <span className="font-medium">
                  {item.actor?.full_name ?? "System"}
                </span>{" "}
                <span className="text-[var(--ink-muted)]">{item.action}</span>
              </span>
              <span className="text-xs text-[var(--ink-muted)]">
                {new Date(item.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
