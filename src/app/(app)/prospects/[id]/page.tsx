import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  addCallLogAction,
  enrollAction,
  updateStatusAction,
} from "@/app/actions/crm";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/session";
import { repo } from "@/lib/data/repository";
import { PIPELINE_LABELS, PIPELINE_STATUSES, ROLE_PERMISSIONS } from "@/lib/types";
import { buildWhatsAppDeepLink } from "@/lib/utils/whatsapp";

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const prospect = await repo.getProspect(id);
  if (!prospect) notFound();

  const [timeline, sequences] = await Promise.all([
    repo.getProspectTimeline(id),
    repo.listSequences(),
  ]);

  const canEdit = ROLE_PERMISSIONS[profile.role].canEditCrm;
  const canNurture = ROLE_PERMISSIONS[profile.role].canSendNurture;
  const waLink = buildWhatsAppDeepLink(
    prospect.phone,
    `Hi ${prospect.full_name}, this is Cyond following up on your enquiry.`
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/pipeline"
            className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            ← Pipeline
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {prospect.full_name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--ink-muted)]">
            <StatusBadge status={prospect.status} />
            <span>{prospect.company || "No company"}</span>
            <span>·</span>
            <span>{prospect.city || "No city"}</span>
            <span>·</span>
            <span>{prospect.source?.name ?? "No source"}</span>
          </div>
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-md bg-[#25D366] px-3.5 py-2 text-sm font-medium text-white"
        >
          WhatsApp
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="text-sm font-semibold">Profile</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--ink-muted)]">Phone</dt>
              <dd className="font-medium">{prospect.phone}</dd>
            </div>
            <div>
              <dt className="text-[var(--ink-muted)]">Email</dt>
              <dd className="font-medium">{prospect.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--ink-muted)]">Owner</dt>
              <dd className="font-medium">
                {prospect.owner?.full_name || "Unassigned"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--ink-muted)]">Created</dt>
              <dd className="font-medium">
                {new Date(prospect.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
          {prospect.notes && (
            <p className="rounded-md bg-[var(--surface-2)] p-3 text-sm">
              {prospect.notes}
            </p>
          )}

          {canEdit && (
            <form action={updateStatusAction} className="flex flex-wrap items-end gap-2 border-t border-[var(--border)] pt-4">
              <input type="hidden" name="prospect_id" value={prospect.id} />
              <label className="grid gap-1 text-xs">
                <span className="text-[var(--ink-muted)]">Update status</span>
                <select
                  name="status"
                  defaultValue={prospect.status}
                  className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  {PIPELINE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {PIPELINE_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="submit" variant="secondary">
                Save status
              </Button>
            </form>
          )}
        </section>

        <section className="space-y-4">
          {canEdit && (
            <form
              action={addCallLogAction}
              className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <h2 className="text-sm font-semibold">Log a call</h2>
              <input type="hidden" name="prospect_id" value={prospect.id} />
              <label className="grid gap-1 text-xs">
                <span className="text-[var(--ink-muted)]">Outcome</span>
                <input
                  required
                  name="outcome"
                  placeholder="Connected / Voicemail / No answer"
                  className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="grid gap-1 text-xs">
                <span className="text-[var(--ink-muted)]">Notes</span>
                <textarea
                  name="notes"
                  rows={2}
                  className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </label>
              <Button type="submit">Save call log</Button>
            </form>
          )}

          {canNurture && (
            <form
              action={enrollAction}
              className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <h2 className="text-sm font-semibold">Enroll in nurture</h2>
              <input type="hidden" name="prospect_id" value={prospect.id} />
              <label className="grid gap-1 text-xs">
                <span className="text-[var(--ink-muted)]">Sequence</span>
                <select
                  name="sequence_id"
                  className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
                  defaultValue={sequences[0]?.id}
                >
                  {sequences.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="submit">Enroll</Button>
              {timeline.enrollments.length > 0 && (
                <ul className="space-y-1 text-xs text-[var(--ink-muted)]">
                  {timeline.enrollments.map((e) => (
                    <li key={e.id}>
                      Active: {e.sequence?.name} (step {e.current_step})
                    </li>
                  ))}
                </ul>
              )}
            </form>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="mb-4 text-sm font-semibold">Communication & activity</h2>
        <ol className="space-y-3">
          {[
            ...timeline.comms.map((c) => ({
              id: c.id,
              at: c.created_at,
              title: `${c.channel} · ${c.status}`,
              body: c.body,
            })),
            ...timeline.activity.map((a) => ({
              id: a.id,
              at: a.created_at,
              title: a.action,
              body: JSON.stringify(a.metadata),
            })),
          ]
            .sort((a, b) => b.at.localeCompare(a.at))
            .map((item) => (
              <li
                key={item.id}
                className="border-l-2 border-[var(--accent)] pl-3"
              >
                <div className="text-xs text-[var(--ink-muted)]">
                  {new Date(item.at).toLocaleString()} · {item.title}
                </div>
                <div className="mt-1 text-sm whitespace-pre-wrap">{item.body}</div>
              </li>
            ))}
          {timeline.comms.length === 0 && timeline.activity.length === 0 && (
            <li className="text-sm text-[var(--ink-muted)]">No activity yet.</li>
          )}
        </ol>
      </section>
    </div>
  );
}
