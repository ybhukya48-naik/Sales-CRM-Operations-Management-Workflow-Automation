import type { DashboardMetrics } from "@/lib/types";
import { PIPELINE_LABELS, PIPELINE_STATUSES } from "@/lib/types";

export function MetricsPanel({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total prospects" value={metrics.totalProspects} />
        <StatCard label="Won this month" value={metrics.wonThisMonth} />
        <StatCard label="Nurture due today" value={metrics.nurtureDueToday} />
        <StatCard
          label="Nurture overdue"
          value={metrics.nurtureOverdue}
          accent={metrics.nurtureOverdue > 0}
        />
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="mb-4 text-sm font-semibold">Funnel by stage</h2>
        <div className="space-y-2">
          {PIPELINE_STATUSES.map((status) => {
            const count = metrics.byStatus[status];
            const max = Math.max(...Object.values(metrics.byStatus), 1);
            const width = Math.round((count / max) * 100);
            return (
              <div key={status} className="grid grid-cols-[110px_1fr_32px] items-center gap-3 text-sm">
                <span className="text-[var(--ink-muted)]">
                  {PIPELINE_LABELS[status]}
                </span>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className="text-right font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="mb-4 text-sm font-semibold">Conversion by source</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[var(--ink-muted)]">
              <tr>
                <th className="pb-2 font-medium">Source</th>
                <th className="pb-2 font-medium">Leads</th>
                <th className="pb-2 font-medium">Won</th>
                <th className="pb-2 font-medium">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {metrics.bySource.map((row) => (
                <tr key={row.source} className="border-b border-[var(--border)]/70">
                  <td className="py-2.5">{row.source}</td>
                  <td className="py-2.5">{row.total}</td>
                  <td className="py-2.5">{row.won}</td>
                  <td className="py-2.5 font-medium">{row.conversion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
        {label}
      </div>
      <div
        className={`mt-2 text-3xl font-semibold tracking-tight ${
          accent ? "text-[var(--danger)]" : "text-[var(--ink)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
