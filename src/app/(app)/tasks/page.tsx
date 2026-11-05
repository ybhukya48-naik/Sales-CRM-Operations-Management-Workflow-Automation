import { redirect } from "next/navigation";
import { TaskList } from "@/components/tasks/task-list";
import { getCurrentProfile } from "@/lib/auth/session";
import { repo } from "@/lib/data/repository";
import { ROLE_PERMISSIONS } from "@/lib/types";

export default async function TasksPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const perms = ROLE_PERMISSIONS[profile.role];
  if (!perms.canSendNurture && !perms.canViewDashboard) {
    redirect("/pipeline");
  }

  const tasks = await repo.listTasksDue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Daily tasks</h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          WhatsApp nurture messages due today or overdue. Open the deep-link,
          send, then mark sent.
        </p>
      </div>
      <TaskList tasks={tasks} canSend={perms.canSendNurture} />
    </div>
  );
}
