export type AppRole = "admin" | "management" | "sales" | "engineer";

export type PipelineStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "nurturing"
  | "proposal"
  | "won"
  | "lost";

export type TaskStatus = "pending" | "sent" | "skipped" | "overdue";

export type EnrollmentStatus = "active" | "paused" | "completed" | "cancelled";

export type CommChannel = "whatsapp" | "call" | "email" | "note" | "system";

export type CommDirection = "outbound" | "inbound" | "internal";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadSource {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Prospect {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  company: string | null;
  city: string | null;
  source_id: string | null;
  status: PipelineStatus;
  owner_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  source?: LeadSource | null;
  owner?: Profile | null;
}

export interface CallLog {
  id: string;
  prospect_id: string;
  user_id: string | null;
  outcome: string;
  notes: string | null;
  called_at: string;
  created_at: string;
  user?: Profile | null;
}

export interface MessageTemplate {
  id: string;
  name: string;
  body: string;
  channel: CommChannel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NurtureSequence {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  steps?: NurtureStep[];
}

export interface NurtureStep {
  id: string;
  sequence_id: string;
  day_offset: number;
  template_id: string;
  sort_order: number;
  created_at: string;
  template?: MessageTemplate | null;
}

export interface NurtureEnrollment {
  id: string;
  prospect_id: string;
  sequence_id: string;
  status: EnrollmentStatus;
  current_step: number;
  enrolled_at: string;
  completed_at: string | null;
  created_at: string;
  sequence?: NurtureSequence | null;
}

export interface DailyTask {
  id: string;
  enrollment_id: string;
  prospect_id: string;
  step_id: string;
  due_date: string;
  status: TaskStatus;
  message_body: string;
  sent_at: string | null;
  sent_by: string | null;
  created_at: string;
  prospect?: Prospect | null;
  step?: NurtureStep | null;
}

export interface CommunicationLog {
  id: string;
  prospect_id: string;
  channel: CommChannel;
  direction: CommDirection;
  body: string;
  status: string;
  created_by: string | null;
  created_at: string;
  creator?: Profile | null;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: Profile | null;
}

export interface DashboardMetrics {
  byStatus: Record<PipelineStatus, number>;
  bySource: { source: string; total: number; won: number; conversion: number }[];
  nurtureDueToday: number;
  nurtureOverdue: number;
  totalProspects: number;
  wonThisMonth: number;
}

export const PIPELINE_STATUSES: PipelineStatus[] = [
  "new",
  "contacted",
  "qualified",
  "nurturing",
  "proposal",
  "won",
  "lost",
];

export const PIPELINE_LABELS: Record<PipelineStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  nurturing: "Nurturing",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  management: "Management",
  sales: "Sales",
  engineer: "Engineer",
};

export const ROLE_PERMISSIONS: Record<
  AppRole,
  {
    canManageUsers: boolean;
    canEditCrm: boolean;
    canViewDashboard: boolean;
    canSendNurture: boolean;
    canViewPipeline: boolean;
  }
> = {
  admin: {
    canManageUsers: true,
    canEditCrm: true,
    canViewDashboard: true,
    canSendNurture: true,
    canViewPipeline: true,
  },
  management: {
    canManageUsers: false,
    canEditCrm: true,
    canViewDashboard: true,
    canSendNurture: false,
    canViewPipeline: true,
  },
  sales: {
    canManageUsers: false,
    canEditCrm: true,
    canViewDashboard: true,
    canSendNurture: true,
    canViewPipeline: true,
  },
  engineer: {
    canManageUsers: false,
    canEditCrm: false,
    canViewDashboard: false,
    canSendNurture: false,
    canViewPipeline: true,
  },
};
