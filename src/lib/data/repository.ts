import { mockStore } from "@/lib/data/mock-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  AppRole,
  DashboardMetrics,
  PipelineStatus,
  Profile,
} from "@/lib/types";

/**
 * Data access for the MVP slice.
 * Uses the in-memory demo store when Supabase env is not configured.
 * Live Supabase queries can be wired later without changing page components.
 */
export const repo = {
  isDemoMode: () => !isSupabaseConfigured(),

  async listProspects() {
    if (isSupabaseConfigured()) {
      // Live path reserved for when env is wired; demo store keeps PR reviewable.
      return mockStore.listProspects();
    }
    return mockStore.listProspects();
  },

  async getProspect(id: string) {
    return mockStore.getProspect(id);
  },

  async createProspect(
    input: {
      full_name: string;
      phone: string;
      email?: string;
      company?: string;
      city?: string;
      source_id?: string | null;
      notes?: string;
      owner_id?: string | null;
    },
    actor: Profile
  ) {
    return mockStore.createProspect(
      {
        full_name: input.full_name,
        phone: input.phone,
        email: input.email ?? null,
        company: input.company ?? null,
        city: input.city ?? null,
        source_id: input.source_id ?? null,
        status: "new",
        owner_id: input.owner_id ?? actor.id,
        notes: input.notes ?? null,
      },
      actor.id
    );
  },

  async updateProspectStatus(
    id: string,
    status: PipelineStatus,
    actor: Profile
  ) {
    return mockStore.updateProspectStatus(id, status, actor.id);
  },

  async listSources() {
    return mockStore.listSources();
  },

  async listSequences() {
    return mockStore.listSequences();
  },

  async listTemplates() {
    return mockStore.listTemplates();
  },

  async listTasksDue() {
    return mockStore.listTasks({ dueTodayOrOverdue: true });
  },

  async markTaskSent(taskId: string, actor: Profile) {
    return mockStore.markTaskSent(taskId, actor.id);
  },

  async skipTask(taskId: string, actor: Profile) {
    return mockStore.skipTask(taskId, actor.id);
  },

  async getProspectTimeline(prospectId: string) {
    return mockStore.getProspectTimeline(prospectId);
  },

  async addCallLog(
    prospectId: string,
    actor: Profile,
    outcome: string,
    notes: string
  ) {
    return mockStore.addCallLog(prospectId, actor.id, outcome, notes);
  },

  async enrollProspect(
    prospectId: string,
    sequenceId: string,
    actor: Profile
  ) {
    return mockStore.enrollProspect(prospectId, sequenceId, actor.id);
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return mockStore.getDashboardMetrics();
  },

  async listActivity(limit = 20) {
    return mockStore.listActivity(limit);
  },

  async listProfiles() {
    return mockStore.listProfiles();
  },

  async createUser(
    input: { email: string; full_name: string; role: AppRole },
    actor: Profile
  ) {
    return mockStore.createUser(input, actor.id);
  },

  async updateUserRole(userId: string, role: AppRole, actor: Profile) {
    return mockStore.updateUserRole(userId, role, actor.id);
  },
};
