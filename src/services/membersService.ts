/**
 * Dedicated Members & Invitations API Service
 */

import { safeFetch } from "../lib/apiConfig";
import { ApiResponse } from "../types/dashboard.types";
import { MembersData, InvitePayload } from "../types/members.types";

export const membersService = {
  /**
   * Fetch all members (/members)
   */
  async getMembers(): Promise<MembersData> {
    const res = await safeFetch("/members", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch members list (${res.status})`);
    }

    const body: ApiResponse<MembersData> = await res.json();
    if (!body.success) {
      throw new Error(body.message || "Failed to retrieve members");
    }

    return body.data;
  },

  /**
   * Send onboarding invite via SMTP (/auth/invite)
   */
  async sendInvite(payload: InvitePayload): Promise<ApiResponse<unknown>> {
    const res = await safeFetch("/auth/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.message || "Failed to send invitation");
    }

    return body;
  },

  /**
   * Update member credentials and role (/members/:userId)
   * Restricted to SUPER_ADMIN on backend
   */
  async updateMember(userId: string, payload: { name?: string; email?: string; role?: string }): Promise<ApiResponse<unknown>> {
    const res = await safeFetch(`/members/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.detail || body.message || "Failed to update member credentials");
    }

    return body;
  },
};
