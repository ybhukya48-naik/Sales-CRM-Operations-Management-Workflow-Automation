"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { repo } from "@/lib/data/repository";
import type { AppRole, PipelineStatus } from "@/lib/types";
import { ROLE_PERMISSIONS } from "@/lib/types";

async function requireActor() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function createProspectAction(formData: FormData) {
  const actor = await requireActor();
  if (!ROLE_PERMISSIONS[actor.role].canEditCrm) {
    throw new Error("Forbidden");
  }

  const prospect = await repo.createProspect(
    {
      full_name: String(formData.get("full_name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim() || undefined,
      company: String(formData.get("company") ?? "").trim() || undefined,
      city: String(formData.get("city") ?? "").trim() || undefined,
      source_id: String(formData.get("source_id") ?? "") || null,
      notes: String(formData.get("notes") ?? "").trim() || undefined,
    },
    actor
  );

  const enroll = formData.get("enroll") === "on";
  const sequenceId = String(formData.get("sequence_id") ?? "");
  if (enroll && sequenceId) {
    await repo.enrollProspect(prospect.id, sequenceId, actor);
  }

  revalidatePath("/pipeline");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect(`/prospects/${prospect.id}`);
}

export async function updateStatusAction(formData: FormData) {
  const actor = await requireActor();
  if (!ROLE_PERMISSIONS[actor.role].canEditCrm) {
    throw new Error("Forbidden");
  }
  const id = String(formData.get("prospect_id"));
  const status = String(formData.get("status")) as PipelineStatus;
  await repo.updateProspectStatus(id, status, actor);
  revalidatePath("/pipeline");
  revalidatePath(`/prospects/${id}`);
  revalidatePath("/dashboard");
}

export async function addCallLogAction(formData: FormData) {
  const actor = await requireActor();
  if (!ROLE_PERMISSIONS[actor.role].canEditCrm) {
    throw new Error("Forbidden");
  }
  const prospectId = String(formData.get("prospect_id"));
  await repo.addCallLog(
    prospectId,
    actor,
    String(formData.get("outcome") ?? "").trim(),
    String(formData.get("notes") ?? "").trim()
  );
  revalidatePath(`/prospects/${prospectId}`);
}

export async function enrollAction(formData: FormData) {
  const actor = await requireActor();
  if (!ROLE_PERMISSIONS[actor.role].canSendNurture) {
    throw new Error("Forbidden");
  }
  const prospectId = String(formData.get("prospect_id"));
  const sequenceId = String(formData.get("sequence_id"));
  await repo.enrollProspect(prospectId, sequenceId, actor);
  revalidatePath(`/prospects/${prospectId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function markTaskSentAction(formData: FormData) {
  const actor = await requireActor();
  if (!ROLE_PERMISSIONS[actor.role].canSendNurture) {
    throw new Error("Forbidden");
  }
  const taskId = String(formData.get("task_id"));
  await repo.markTaskSent(taskId, actor);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/pipeline");
}

export async function skipTaskAction(formData: FormData) {
  const actor = await requireActor();
  if (!ROLE_PERMISSIONS[actor.role].canSendNurture) {
    throw new Error("Forbidden");
  }
  const taskId = String(formData.get("task_id"));
  await repo.skipTask(taskId, actor);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function createUserAction(formData: FormData) {
  const actor = await requireActor();
  if (!ROLE_PERMISSIONS[actor.role].canManageUsers) {
    throw new Error("Forbidden");
  }
  await repo.createUser(
    {
      email: String(formData.get("email") ?? "").trim(),
      full_name: String(formData.get("full_name") ?? "").trim(),
      role: String(formData.get("role")) as AppRole,
    },
    actor
  );
  revalidatePath("/users");
}

export async function updateUserRoleAction(formData: FormData) {
  const actor = await requireActor();
  if (!ROLE_PERMISSIONS[actor.role].canManageUsers) {
    throw new Error("Forbidden");
  }
  await repo.updateUserRole(
    String(formData.get("user_id")),
    String(formData.get("role")) as AppRole,
    actor
  );
  revalidatePath("/users");
}
