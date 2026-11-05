import {
  DEMO_ACTIVITY,
  DEMO_CALLS,
  DEMO_COMMS,
  DEMO_ENROLLMENTS,
  DEMO_PROFILES,
  DEMO_PROSPECTS,
  DEMO_SEQUENCES,
  DEMO_SOURCES,
  DEMO_STEPS,
  DEMO_TASKS,
  DEMO_TEMPLATES,
} from "@/lib/data/seed";
import type {
  ActivityLog,
  CallLog,
  CommunicationLog,
  DailyTask,
  DashboardMetrics,
  LeadSource,
  MessageTemplate,
  NurtureEnrollment,
  NurtureSequence,
  PipelineStatus,
  Profile,
  Prospect,
  TaskStatus,
} from "@/lib/types";
import { PIPELINE_STATUSES } from "@/lib/types";
import { renderTemplate } from "@/lib/utils/whatsapp";

function clone<T>(value: T): T {
  return structuredClone(value);
}

type Store = {
  profiles: Profile[];
  sources: LeadSource[];
  prospects: Prospect[];
  templates: MessageTemplate[];
  sequences: NurtureSequence[];
  steps: typeof DEMO_STEPS;
  enrollments: NurtureEnrollment[];
  tasks: DailyTask[];
  calls: CallLog[];
  comms: CommunicationLog[];
  activity: ActivityLog[];
};

const globalForStore = globalThis as unknown as { __cyondStore?: Store };

function getStore(): Store {
  if (!globalForStore.__cyondStore) {
    globalForStore.__cyondStore = {
      profiles: clone(DEMO_PROFILES),
      sources: clone(DEMO_SOURCES),
      prospects: clone(DEMO_PROSPECTS),
      templates: clone(DEMO_TEMPLATES),
      sequences: clone(DEMO_SEQUENCES),
      steps: clone(DEMO_STEPS),
      enrollments: clone(DEMO_ENROLLMENTS),
      tasks: clone(DEMO_TASKS),
      calls: clone(DEMO_CALLS),
      comms: clone(DEMO_COMMS),
      activity: clone(DEMO_ACTIVITY),
    };
  }
  return globalForStore.__cyondStore;
}

function attachProspect(p: Prospect): Prospect {
  const store = getStore();
  return {
    ...p,
    source: store.sources.find((s) => s.id === p.source_id) ?? null,
    owner: store.profiles.find((u) => u.id === p.owner_id) ?? null,
  };
}

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function logActivity(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {}
) {
  const store = getStore();
  store.activity.unshift({
    id: uid("act"),
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
    created_at: new Date().toISOString(),
  });
}

export const mockStore = {
  getProfile(id: string) {
    return getStore().profiles.find((p) => p.id === id) ?? null;
  },

  listProfiles() {
    return clone(getStore().profiles);
  },

  listSources() {
    return clone(getStore().sources);
  },

  listProspects() {
    return getStore()
      .prospects.map(attachProspect)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  },

  getProspect(id: string) {
    const p = getStore().prospects.find((x) => x.id === id);
    return p ? attachProspect(p) : null;
  },

  createProspect(
    input: Omit<Prospect, "id" | "created_at" | "updated_at" | "source" | "owner">,
    actorId: string
  ) {
    const store = getStore();
    const now = new Date().toISOString();
    const prospect: Prospect = {
      ...input,
      id: uid("prs"),
      created_at: now,
      updated_at: now,
    };
    store.prospects.unshift(prospect);
    logActivity(actorId, "prospect.created", "prospect", prospect.id, {
      status: prospect.status,
    });
    return attachProspect(prospect);
  },

  updateProspectStatus(id: string, status: PipelineStatus, actorId: string) {
    const store = getStore();
    const prospect = store.prospects.find((p) => p.id === id);
    if (!prospect) return null;
    const from = prospect.status;
    prospect.status = status;
    prospect.updated_at = new Date().toISOString();
    logActivity(actorId, "prospect.status_changed", "prospect", id, {
      from,
      to: status,
    });
    return attachProspect(prospect);
  },

  listSequences() {
    const store = getStore();
    return store.sequences.map((seq) => ({
      ...seq,
      steps: store.steps
        .filter((s) => s.sequence_id === seq.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => ({
          ...s,
          template: store.templates.find((t) => t.id === s.template_id) ?? null,
        })),
    }));
  },

  listTemplates() {
    return clone(getStore().templates);
  },

  listTasks(filter?: { dueTodayOrOverdue?: boolean }) {
    const store = getStore();
    const today = new Date().toISOString().slice(0, 10);
    let tasks = store.tasks.map((t) => ({
      ...t,
      prospect: store.prospects.find((p) => p.id === t.prospect_id)
        ? attachProspect(store.prospects.find((p) => p.id === t.prospect_id)!)
        : null,
      step: store.steps.find((s) => s.id === t.step_id) ?? null,
    }));

    if (filter?.dueTodayOrOverdue) {
      tasks = tasks.filter(
        (t) =>
          (t.status === "pending" || t.status === "overdue") &&
          t.due_date <= today
      );
    }

    return tasks.sort((a, b) => a.due_date.localeCompare(b.due_date));
  },

  markTaskSent(taskId: string, actorId: string) {
    const store = getStore();
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) return null;
    task.status = "sent";
    task.sent_at = new Date().toISOString();
    task.sent_by = actorId;
    store.comms.unshift({
      id: uid("comm"),
      prospect_id: task.prospect_id,
      channel: "whatsapp",
      direction: "outbound",
      body: task.message_body,
      status: "sent",
      created_by: actorId,
      created_at: task.sent_at,
    });
    logActivity(actorId, "task.sent", "daily_task", task.id, {
      channel: "whatsapp",
    });
    return clone(task);
  },

  skipTask(taskId: string, actorId: string) {
    const store = getStore();
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) return null;
    task.status = "skipped";
    logActivity(actorId, "task.skipped", "daily_task", task.id, {});
    return clone(task);
  },

  getProspectTimeline(prospectId: string) {
    const store = getStore();
    const calls = store.calls
      .filter((c) => c.prospect_id === prospectId)
      .map((c) => ({
        ...c,
        user: store.profiles.find((p) => p.id === c.user_id) ?? null,
      }));
    const comms = store.comms
      .filter((c) => c.prospect_id === prospectId)
      .map((c) => ({
        ...c,
        creator: store.profiles.find((p) => p.id === c.created_by) ?? null,
      }));
    const activity = store.activity
      .filter((a) => a.entity_id === prospectId || a.entity_type === "prospect")
      .filter((a) => a.entity_id === prospectId)
      .map((a) => ({
        ...a,
        actor: store.profiles.find((p) => p.id === a.actor_id) ?? null,
      }));
    const enrollments = store.enrollments
      .filter((e) => e.prospect_id === prospectId)
      .map((e) => ({
        ...e,
        sequence: store.sequences.find((s) => s.id === e.sequence_id) ?? null,
      }));
    return { calls, comms, activity, enrollments };
  },

  addCallLog(
    prospectId: string,
    actorId: string,
    outcome: string,
    notes: string
  ) {
    const store = getStore();
    const now = new Date().toISOString();
    const entry: CallLog = {
      id: uid("call"),
      prospect_id: prospectId,
      user_id: actorId,
      outcome,
      notes,
      called_at: now,
      created_at: now,
    };
    store.calls.unshift(entry);
    store.comms.unshift({
      id: uid("comm"),
      prospect_id: prospectId,
      channel: "call",
      direction: "outbound",
      body: `${outcome}${notes ? ` — ${notes}` : ""}`,
      status: "logged",
      created_by: actorId,
      created_at: now,
    });
    logActivity(actorId, "call.logged", "prospect", prospectId, { outcome });
    return entry;
  },

  enrollProspect(prospectId: string, sequenceId: string, actorId: string) {
    const store = getStore();
    const prospect = store.prospects.find((p) => p.id === prospectId);
    const sequence = store.sequences.find((s) => s.id === sequenceId);
    if (!prospect || !sequence) return null;

    const existing = store.enrollments.find(
      (e) => e.prospect_id === prospectId && e.sequence_id === sequenceId
    );
    if (existing) return existing;

    const now = new Date();
    const enrollment: NurtureEnrollment = {
      id: uid("enr"),
      prospect_id: prospectId,
      sequence_id: sequenceId,
      status: "active",
      current_step: 0,
      enrolled_at: now.toISOString(),
      completed_at: null,
      created_at: now.toISOString(),
    };
    store.enrollments.unshift(enrollment);

    const steps = store.steps
      .filter((s) => s.sequence_id === sequenceId)
      .sort((a, b) => a.sort_order - b.sort_order);

    for (const step of steps) {
      const template = store.templates.find((t) => t.id === step.template_id);
      if (!template) continue;
      const due = new Date(now);
      due.setDate(due.getDate() + step.day_offset);
      const body = renderTemplate(template.body, {
        name: prospect.full_name,
        company: prospect.company ?? "your project",
        city: prospect.city ?? "your city",
      });
      store.tasks.push({
        id: uid("task"),
        enrollment_id: enrollment.id,
        prospect_id: prospectId,
        step_id: step.id,
        due_date: due.toISOString().slice(0, 10),
        status: "pending" as TaskStatus,
        message_body: body,
        sent_at: null,
        sent_by: null,
        created_at: now.toISOString(),
      });
    }

    if (prospect.status === "new" || prospect.status === "contacted") {
      prospect.status = "nurturing";
      prospect.updated_at = now.toISOString();
    }

    logActivity(actorId, "nurture.enrolled", "prospect", prospectId, {
      sequence: sequence.name,
    });
    return enrollment;
  },

  getDashboardMetrics(): DashboardMetrics {
    const store = getStore();
    const byStatus = Object.fromEntries(
      PIPELINE_STATUSES.map((s) => [s, 0])
    ) as Record<PipelineStatus, number>;
    for (const p of store.prospects) {
      byStatus[p.status] += 1;
    }

    const bySource = store.sources.map((source) => {
      const related = store.prospects.filter((p) => p.source_id === source.id);
      const won = related.filter((p) => p.status === "won").length;
      const total = related.length;
      return {
        source: source.name,
        total,
        won,
        conversion: total ? Math.round((won / total) * 100) : 0,
      };
    });

    const today = new Date().toISOString().slice(0, 10);
    const openTasks = store.tasks.filter(
      (t) => t.status === "pending" || t.status === "overdue"
    );
    const nurtureDueToday = openTasks.filter((t) => t.due_date === today).length;
    const nurtureOverdue = openTasks.filter((t) => t.due_date < today).length;

    const month = today.slice(0, 7);
    const wonThisMonth = store.prospects.filter(
      (p) => p.status === "won" && p.updated_at.startsWith(month)
    ).length;

    return {
      byStatus,
      bySource,
      nurtureDueToday,
      nurtureOverdue,
      totalProspects: store.prospects.length,
      wonThisMonth,
    };
  },

  listActivity(limit = 20): ActivityLog[] {
    const store = getStore();
    return store.activity.slice(0, limit).map((a) => ({
      ...a,
      actor: store.profiles.find((p) => p.id === a.actor_id) ?? null,
    }));
  },

  createUser(
    input: { email: string; full_name: string; role: Profile["role"] },
    actorId: string
  ) {
    const store = getStore();
    const now = new Date().toISOString();
    const profile: Profile = {
      id: uid("user"),
      email: input.email,
      full_name: input.full_name,
      role: input.role,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    store.profiles.push(profile);
    logActivity(actorId, "user.created", "profile", profile.id, {
      role: profile.role,
    });
    return profile;
  },

  updateUserRole(userId: string, role: Profile["role"], actorId: string) {
    const store = getStore();
    const profile = store.profiles.find((p) => p.id === userId);
    if (!profile) return null;
    const from = profile.role;
    profile.role = role;
    profile.updated_at = new Date().toISOString();
    logActivity(actorId, "user.role_changed", "profile", userId, {
      from,
      to: role,
    });
    return clone(profile);
  },
};
