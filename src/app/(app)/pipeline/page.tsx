import { redirect } from "next/navigation";
import { NewProspectForm } from "@/components/pipeline/new-prospect-form";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { getCurrentProfile } from "@/lib/auth/session";
import { repo } from "@/lib/data/repository";
import { ROLE_PERMISSIONS } from "@/lib/types";

export default async function PipelinePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!ROLE_PERMISSIONS[profile.role].canViewPipeline) redirect("/login");

  const [prospects, sources, sequences] = await Promise.all([
    repo.listProspects(),
    repo.listSources(),
    repo.listSequences(),
  ]);

  const canEdit = ROLE_PERMISSIONS[profile.role].canEditCrm;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Track prospects from first enquiry through win/loss.
        </p>
      </div>

      {canEdit && (
        <NewProspectForm sources={sources} sequences={sequences} />
      )}

      <PipelineBoard prospects={prospects} />
    </div>
  );
}
