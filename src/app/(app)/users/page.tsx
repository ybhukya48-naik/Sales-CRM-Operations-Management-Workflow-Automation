import { redirect } from "next/navigation";
import { createUserAction, updateUserRoleAction } from "@/app/actions/crm";
import { RoleBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/session";
import { repo } from "@/lib/data/repository";
import { ROLE_LABELS, ROLE_PERMISSIONS, type AppRole } from "@/lib/types";

const ROLES: AppRole[] = ["admin", "management", "sales", "engineer"];

export default async function UsersPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!ROLE_PERMISSIONS[profile.role].canManageUsers) {
    redirect("/pipeline");
  }

  const users = await repo.listProfiles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users & roles</h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Admin-only user management. Roles: Admin, Management, Sales, Engineer.
        </p>
      </div>

      <form
        action={createUserAction}
        className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-4"
      >
        <h2 className="sm:col-span-4 text-sm font-semibold">Add user</h2>
        <label className="grid gap-1 text-xs">
          <span className="text-[var(--ink-muted)]">Full name</span>
          <input
            required
            name="full_name"
            className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs">
          <span className="text-[var(--ink-muted)]">Email</span>
          <input
            required
            type="email"
            name="email"
            className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs">
          <span className="text-[var(--ink-muted)]">Role</span>
          <select
            name="role"
            defaultValue="sales"
            className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <Button type="submit">Create</Button>
        </div>
      </form>

      <section className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-[var(--border)] text-[var(--ink-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Update</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[var(--border)]/70">
                <td className="px-4 py-3 font-medium">{user.full_name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3">
                  <form action={updateUserRoleAction} className="flex gap-2">
                    <input type="hidden" name="user_id" value={user.id} />
                    <select
                      name="role"
                      defaultValue={user.role}
                      className="rounded-md border border-[var(--border)] bg-white px-2 py-1.5 text-xs"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" variant="secondary" className="text-xs">
                      Save
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
