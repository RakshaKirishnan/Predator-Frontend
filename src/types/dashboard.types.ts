/**
 * Frontend Dashboard Type Definitions & Schemas
 */

export interface DashboardCardsData {
  users: number;
  pending_invites: number;
  accepted_invites: number;
  total_invites: number;
}

export interface UsageLog {
  log_id: string;
  username: string;
  email: string;
  action: string;
  ip_address: string;
  user_agent: string;
  location: string;
  captured_face_image?: string;
  timestamp: string;
}


export interface UsageLogsData {
  logs: UsageLog[];
  total: number;
  page: number;
  limit: number;
}

export interface MemberItem {
  user_id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  created_at: string;
}

export interface MembersData {
  members: MemberItem[];
  total: number;
}

export interface InvitePayload {
  email: string;
  name: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface HealthStatusData {
  engine_ready: boolean;
  model: string;
  endpoints: string[];
}
