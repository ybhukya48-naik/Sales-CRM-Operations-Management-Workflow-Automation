import { cn } from "@/lib/utils/cn";
import type { PipelineStatus, TaskStatus } from "@/lib/types";

const statusColors: Record<PipelineStatus, string> = {
  new: "bg-sky-50 text-sky-800 ring-sky-200",
  contacted: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  qualified: "bg-violet-50 text-violet-800 ring-violet-200",
  nurturing: "bg-amber-50 text-amber-900 ring-amber-200",
  proposal: "bg-orange-50 text-orange-900 ring-orange-200",
  won: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  lost: "bg-slate-100 text-slate-600 ring-slate-200",
};

const taskColors: Record<TaskStatus, string> = {
  pending: "bg-amber-50 text-amber-900 ring-amber-200",
  overdue: "bg-rose-50 text-rose-800 ring-rose-200",
  sent: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  skipped: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function StatusBadge({ status }: { status: PipelineStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        statusColors[status]
      )}
    >
      {status}
    </span>
  );
}

export function TaskBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize",
        taskColors[status]
      )}
    >
      {status}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium capitalize text-[var(--ink-muted)] ring-1 ring-inset ring-[var(--border)]">
      {role}
    </span>
  );
}
