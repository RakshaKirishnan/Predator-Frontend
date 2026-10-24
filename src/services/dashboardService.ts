/**
 * Dashboard API Service Layer
 */

import { safeFetch, clearAuthToken } from "../lib/apiConfig";
import {
  ApiResponse,
  DashboardCardsData,
  UsageLogsData,
  HealthStatusData,
  MembersData,
  InvitePayload,
} from "../types/dashboard.types";

export const dashboardService = {
  /**
   * Validate cookie session and return current user (/auth/me)
   */
  async getCurrentUser(): Promise<{ user_id: string; email: string; name: string; role: string }> {
    const res = await safeFetch("/auth/me", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Unauthenticated session");
    }

    const body = await res.json();
    if (!body.success) {
      throw new Error(body.message || "Failed to validate session");
    }

    return body.data;
  },

  /**
   * Fetch 4 metric cards data (/dashboard/cards)
   */
  async getDashboardCards(): Promise<DashboardCardsData> {
    const res = await safeFetch("/dashboard/cards", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch cards data (${res.status})`);
    }

    const body: ApiResponse<DashboardCardsData> = await res.json();
    if (!body.success) {
      throw new Error(body.message || "Failed to retrieve dashboard cards");
    }

    return body.data;
  },

  /**
   * Fetch paginated usage logs (/dashboard/usage-logs)
   */
  async getUsageLogs(page: number = 1, limit: number = 10): Promise<UsageLogsData> {
    const res = await safeFetch(`/dashboard/usage-logs?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch usage logs (${res.status})`);
    }

    const body: ApiResponse<UsageLogsData> = await res.json();
    if (!body.success) {
      throw new Error(body.message || "Failed to retrieve usage logs");
    }

    return body.data;
  },

  /**
   * Fetch list of all enrolled user members (/dashboard/members)
   */
  async getMembers(): Promise<MembersData> {
    const res = await safeFetch("/dashboard/members", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch members (${res.status})`);
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
   * Fetch system health (/auth/health)
   */
  async getHealthStatus(): Promise<HealthStatusData> {
    const res = await safeFetch("/auth/health", {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error(`Health check failed (${res.status})`);
    }

    const body: ApiResponse<HealthStatusData> = await res.json();
    return body.data;
  },

  /**
   * Execute logout (/auth/logout)
   */
  async logout(): Promise<void> {
    try {
      await safeFetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      clearAuthToken();
    }
  },
};

