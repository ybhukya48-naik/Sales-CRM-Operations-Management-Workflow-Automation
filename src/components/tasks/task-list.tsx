import {
  markTaskSentAction,
  skipTaskAction,
} from "@/app/actions/crm";
import { TaskBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DailyTask } from "@/lib/types";
import { buildWhatsAppDeepLink } from "@/lib/utils/whatsapp";

export function TaskList({
  tasks,
  canSend,
}: {
  tasks: DailyTask[];
  canSend: boolean;
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-12 text-center text-sm text-[var(--ink-muted)]">
        No WhatsApp tasks due today or overdue. Nice work.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => {
        const phone = task.prospect?.phone ?? "";
        const deepLink = phone
          ? buildWhatsAppDeepLink(phone, task.message_body)
          : "#";
        return (
          <li
            key={task.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {task.prospect?.full_name ?? "Prospect"}
                  </h3>
                  <TaskBadge status={task.status} />
                </div>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  Due {task.due_date} · Day offset{" "}
                  {task.step?.day_offset ?? "—"} · {task.prospect?.phone}
                </p>
              </div>
              {canSend && (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={deepLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md bg-[#25D366] px-3.5 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Open WhatsApp
                  </a>
                  <form action={markTaskSentAction}>
                    <input type="hidden" name="task_id" value={task.id} />
                    <Button type="submit" variant="secondary">
                      Mark sent
                    </Button>
                  </form>
                  <form action={skipTaskAction}>
                    <input type="hidden" name="task_id" value={task.id} />
                    <Button type="submit" variant="ghost">
                      Skip
                    </Button>
                  </form>
                </div>
              )}
            </div>
            <p className="mt-3 whitespace-pre-wrap rounded-md bg-[var(--surface-2)] p-3 text-sm leading-relaxed text-[var(--ink)]">
              {task.message_body}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
