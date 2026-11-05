import { createProspectAction } from "@/app/actions/crm";
import { Button } from "@/components/ui/button";
import type { LeadSource, NurtureSequence } from "@/lib/types";

export function NewProspectForm({
  sources,
  sequences,
}: {
  sources: LeadSource[];
  sequences: NurtureSequence[];
}) {
  return (
    <form
      action={createProspectAction}
      className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2"
    >
      <h2 className="sm:col-span-2 text-sm font-semibold">Add prospect</h2>
      <label className="grid gap-1 text-xs">
        <span className="text-[var(--ink-muted)]">Full name</span>
        <input
          required
          name="full_name"
          className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="grid gap-1 text-xs">
        <span className="text-[var(--ink-muted)]">Phone (WhatsApp)</span>
        <input
          required
          name="phone"
          placeholder="+91..."
          className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="grid gap-1 text-xs">
        <span className="text-[var(--ink-muted)]">Email</span>
        <input
          name="email"
          type="email"
          className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="grid gap-1 text-xs">
        <span className="text-[var(--ink-muted)]">Company</span>
        <input
          name="company"
          className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="grid gap-1 text-xs">
        <span className="text-[var(--ink-muted)]">City</span>
        <input
          name="city"
          className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="grid gap-1 text-xs">
        <span className="text-[var(--ink-muted)]">Lead source</span>
        <select
          name="source_id"
          className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
        >
          <option value="">Select source</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-2 grid gap-1 text-xs">
        <span className="text-[var(--ink-muted)]">Notes</span>
        <textarea
          name="notes"
          rows={2}
          className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="enroll" defaultChecked />
        Enroll in nurture sequence
      </label>
      <label className="grid gap-1 text-xs">
        <span className="text-[var(--ink-muted)]">Sequence</span>
        <select
          name="sequence_id"
          defaultValue={sequences[0]?.id}
          className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
        >
          {sequences.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <div className="sm:col-span-2">
        <Button type="submit">Create prospect</Button>
      </div>
    </form>
  );
}
