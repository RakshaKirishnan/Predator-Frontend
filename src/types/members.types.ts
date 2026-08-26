/**
 * Members & Invitations Schema & Types
 */

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
