/**
 * System Settings & Email Template Management Service
 */

import { safeFetch } from "../lib/apiConfig";
import { ApiResponse } from "../types/dashboard.types";

export interface EmailTemplateItem {
  id: string;
  name: string;
  subject: string;
  body: string;
  placeholders: string[];
}

export interface EmailTemplatesDocData {
  doc_type: string;
  email_templates: EmailTemplateItem[];
  updated_at: string;
  is_customized: boolean;
}

export interface EmailPreviewData {
  html_rendered: string;
  markdown_substituted: string;
  sample_context: Record<string, unknown>;
}

export const settingsService = {
  /**
   * Fetch all email templates array from app_settings collection
   */
  async listEmailTemplates(): Promise<EmailTemplatesDocData> {
    const res = await safeFetch("/settings/email-templates", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch email templates (${res.status})`);
    }

    const body: ApiResponse<EmailTemplatesDocData> = await res.json();
    if (!body.success) {
      throw new Error(body.message || "Failed to retrieve email templates");
    }

    return body.data;
  },

  /**
   * Save updated email template item in app_settings collection array
   */
  async updateEmailTemplate(templateId: string, payload: { subject: string; body: string }): Promise<EmailTemplatesDocData> {
    const res = await safeFetch(`/settings/email-templates/${templateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.detail || body.message || "Failed to save email template");
    }

    return body.data;
  },

  /**
   * Reset template array to system defaults
   */
  async resetEmailTemplates(): Promise<EmailTemplatesDocData> {
    const res = await safeFetch("/settings/email-templates/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.detail || body.message || "Failed to reset email templates");
    }

    return body.data;
  },

  /**
   * Generate live HTML and Markdown preview with sample context
   */
  async previewEmailTemplate(payload: { subject?: string; body: string }): Promise<EmailPreviewData> {
    const res = await safeFetch("/settings/email-templates/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.detail || body.message || "Failed to generate preview");
    }

    return body.data;
  },
};
