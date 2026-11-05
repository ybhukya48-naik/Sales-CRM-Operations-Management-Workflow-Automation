import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { repo } from "@/lib/data/repository";
import { ROLE_PERMISSIONS } from "@/lib/types";

export default async function NurturePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const perms = ROLE_PERMISSIONS[profile.role];
  if (!perms.canSendNurture && !perms.canViewDashboard) {
    redirect("/pipeline");
  }

  const [sequences, templates] = await Promise.all([
    repo.listSequences(),
    repo.listTemplates(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Nurture sequences
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Configurable 30-day WhatsApp sequences with day offsets and message
          templates.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sequences.map((sequence) => (
          <section
            key={sequence.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <h2 className="font-semibold">{sequence.name}</h2>
              <span className="text-xs text-[var(--ink-muted)]">
                {sequence.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mb-4 text-sm text-[var(--ink-muted)]">
              {sequence.description}
            </p>
            <ol className="space-y-3">
              {(sequence.steps ?? []).map((step) => (
                <li
                  key={step.id}
                  className="rounded-md border border-[var(--border)] bg-white p-3"
                >
                  <div className="mb-1 flex items-center justify-between text-xs text-[var(--ink-muted)]">
                    <span>Day {step.day_offset}</span>
                    <span>{step.template?.name}</span>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {step.template?.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="mb-4 text-sm font-semibold">Message templates</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {templates.map((tpl) => (
            <article
              key={tpl.id}
              className="rounded-md border border-[var(--border)] bg-white p-3"
            >
              <div className="mb-1 text-sm font-medium">{tpl.name}</div>
              <div className="mb-2 text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">
                {tpl.channel}
              </div>
              <p className="text-sm text-[var(--ink-muted)] whitespace-pre-wrap">
                {tpl.body}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--ink-muted)]">
          Placeholders: {"{{name}}"}, {"{{company}}"}, {"{{city}}"}.
        </p>
      </section>
    </div>
  );
}
