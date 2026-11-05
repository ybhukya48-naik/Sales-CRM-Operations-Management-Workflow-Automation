import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import type { Prospect } from "@/lib/types";
import { PIPELINE_LABELS, PIPELINE_STATUSES } from "@/lib/types";

export function PipelineBoard({ prospects }: { prospects: Prospect[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {PIPELINE_STATUSES.map((status) => {
        const column = prospects.filter((p) => p.status === status);
        return (
          <section
            key={status}
            className="min-w-[240px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
          >
            <header className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5">
              <h2 className="text-sm font-semibold">
                {PIPELINE_LABELS[status]}
              </h2>
              <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--ink-muted)]">
                {column.length}
              </span>
            </header>
            <ul className="space-y-2 p-2">
              {column.map((prospect) => (
                <li key={prospect.id}>
                  <Link
                    href={`/prospects/${prospect.id}`}
                    className="block rounded-md border border-[var(--border)] bg-white p-3 hover:border-[var(--accent)] hover:shadow-sm"
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div className="font-medium leading-snug">
                        {prospect.full_name}
                      </div>
                      <StatusBadge status={prospect.status} />
                    </div>
                    <div className="text-xs text-[var(--ink-muted)]">
                      {prospect.company || "—"} · {prospect.city || "—"}
                    </div>
                    <div className="mt-2 text-[11px] text-[var(--ink-muted)]">
                      {prospect.source?.name ?? "No source"} ·{" "}
                      {prospect.owner?.full_name?.split(" ")[0] ?? "Unassigned"}
                    </div>
                  </Link>
                </li>
              ))}
              {column.length === 0 && (
                <li className="px-2 py-6 text-center text-xs text-[var(--ink-muted)]">
                  No prospects
                </li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
