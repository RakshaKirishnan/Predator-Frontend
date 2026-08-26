"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Code2,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Tag,
  ShieldAlert,
  FileText,
  ChevronRight,
  X,
} from "lucide-react";
import { settingsService, EmailTemplatesDocData, EmailPreviewData } from "../../services/settingsService";

interface ParsedTemplate {
  template_key: string;
  name: string;
  subject: string;
  body: string;
  placeholders: string[];
  rawItem: Record<string, unknown>;
}

function parseRawItem(raw: Record<string, unknown>, index: number): ParsedTemplate {
  const key = String(raw.template_key || (index === 0 ? "registration" : index === 1 ? "warning" : "welcome")).toLowerCase();
  const prefix = key.charAt(0).toUpperCase() + key.slice(1);
  
  const subjectKey = `${prefix}_email_template_subject`;
  const bodyKey = `${prefix}_email_template_body`;
  const placeholdersKey = `${prefix}_email_template_placeholders`;

  const name = String(raw.name || `${prefix} Email Template`);
  const subject = String(raw[subjectKey] || raw.subject || "");
  const body = String(raw[bodyKey] || raw.body || "");
  const placeholders = (raw[placeholdersKey] || raw.placeholders || ["name", "email", "invite_link", "expires_hours"]) as string[];

  return {
    template_key: key,
    name,
    subject,
    body,
    placeholders,
    rawItem: raw,
  };
}

export function EmailTemplateEditor() {
  const [parsedTemplates, setParsedTemplates] = useState<ParsedTemplate[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("registration");
  
  const [subject, setSubject] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [placeholders, setPlaceholders] = useState<string[]>([]);

  // Code Source Popup Modal state
  const [showCodeModal, setShowCodeModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [previewData, setPreviewData] = useState<EmailPreviewData | null>(null);
  const [isCustomized, setIsCustomized] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Load template array from app_settings collection
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data: EmailTemplatesDocData = await settingsService.listEmailTemplates();
      const rawList = (data.email_templates as unknown as Record<string, unknown>[]) || [];
      const parsed = rawList.map((item, idx) => parseRawItem(item, idx));
      
      setParsedTemplates(parsed);
      setIsCustomized(data.is_customized);
      setLastUpdated(data.updated_at);

      // Select active template
      const active = parsed.find((t) => t.template_key === selectedKey) || parsed[0];
      if (active) {
        setSelectedKey(active.template_key);
        setSubject(active.subject);
        setBodyMarkdown(active.body);
        setPlaceholders(active.placeholders);
        
        // Initial preview
        const prev = await settingsService.previewEmailTemplate({
          subject: active.subject,
          body: active.body,
        });
        setPreviewData(prev);
      }
    } catch (err) {
      setToast({
        type: "error",
        msg: err instanceof Error ? err.message : "Failed to load email templates",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedKey]);

  useEffect(() => {
    void loadTemplates();
  }, []);

  const handleSelectTemplate = (tpl: ParsedTemplate) => {
    setSelectedKey(tpl.template_key);
    setSubject(tpl.subject);
    setBodyMarkdown(tpl.body);
    setPlaceholders(tpl.placeholders);
    setToast(null);

    void settingsService.previewEmailTemplate({
      subject: tpl.subject,
      body: tpl.body,
    }).then(setPreviewData).catch(() => {});
  };

  const handleGeneratePreview = useCallback(async (currentBody: string, currentSubject?: string) => {
    try {
      const prev = await settingsService.previewEmailTemplate({
        subject: currentSubject || subject,
        body: currentBody,
      });
      setPreviewData(prev);
    } catch {
      // Non-blocking
    }
  }, [subject]);

  const handleBodyChange = (val: string) => {
    setBodyMarkdown(val);
    void handleGeneratePreview(val);
  };

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    void handleGeneratePreview(bodyMarkdown, val);
  };

  const handleInsertVariable = (varName: string) => {
    const varTag = `{{${varName}}}`;
    const updated = `${bodyMarkdown} ${varTag}`;
    setBodyMarkdown(updated);
    void handleGeneratePreview(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const updatedDoc = await settingsService.updateEmailTemplate(selectedKey, {
        subject,
        body: bodyMarkdown,
      });
      const rawList = (updatedDoc.email_templates as unknown as Record<string, unknown>[]) || [];
      const parsed = rawList.map((item, idx) => parseRawItem(item, idx));
      setParsedTemplates(parsed);
      setIsCustomized(updatedDoc.is_customized);
      setLastUpdated(updatedDoc.updated_at);
      setToast({ type: "success", msg: `Saved template '${selectedKey}' to app_settings collection!` });
      setShowCodeModal(false);
    } catch (err) {
      setToast({
        type: "error",
        msg: err instanceof Error ? err.message : "Failed to save template",
      });
    } finally {
      setSaving(false);
    }
  };

  const activeTemplate = parsedTemplates.find((t) => t.template_key === selectedKey);

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Toast Notification Banner */}
      {toast && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            backgroundColor: toast.type === "success" ? "#ecfdf5" : "#fef2f2",
            border: toast.type === "success" ? "1px solid #10b981" : "1px solid #ef4444",
            color: toast.type === "success" ? "#065f46" : "#991b1b",
            fontSize: "0.85rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 style={{ width: 18, height: 18, color: "#10b981" }} />
          ) : (
            <AlertCircle style={{ width: 18, height: 18, color: "#ef4444" }} />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Mail style={{ width: 22, height: 22, color: "#009669" }} />
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#111827", fontFamily: "var(--font-archivo-black)" }}>
            Email Templates Console
          </h1>
          
        </div>
        <p style={{ margin: "0.3rem 0 0 0", color: "#6b7280", fontSize: "0.88rem" }}>
          Select an email template from the sidebar to view its live rendered formatting or edit its source code via the &lt;&gt; code button.
        </p>
      </div>

      {/* Main Settings Console Layout: Left Inner Sidebar + Right Area */}
      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "1.5rem", minHeight: "550px" }}>
        
        {/* Left Inner Sidebar: Email Templates List */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em", padding: "0.5rem 0.5rem 0.75rem 0.5rem", borderBottom: "1px solid #f1f5f9" }}>
            Email Templates ({parsedTemplates.length})
          </div>

          {parsedTemplates.map((tpl) => {
            const isActive = tpl.template_key === selectedKey;
            const isWarning = tpl.template_key.includes("warning");

            return (
              <button
                key={tpl.template_key}
                onClick={() => handleSelectTemplate(tpl)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.75rem",
                  borderRadius: "10px",
                  border: isActive ? "1px solid #009669" : "1px solid transparent",
                  backgroundColor: isActive ? "#ecfdf5" : "transparent",
                  color: isActive ? "#009669" : "#334155",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", overflow: "hidden" }}>
                  {isWarning ? (
                    <ShieldAlert style={{ width: 16, height: 16, color: isActive ? "#009669" : "#d97706", flexShrink: 0 }} />
                  ) : (
                    <FileText style={{ width: 16, height: 16, color: isActive ? "#009669" : "#64748b", flexShrink: 0 }} />
                  )}
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {tpl.name}
                  </span>
                </div>
                <ChevronRight style={{ width: 14, height: 14, opacity: isActive ? 1 : 0.4 }} />
              </button>
            );
          })}
        </div>

        {/* Right Area: Active Template Display & Live Render */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          
          {/* Active Template Header & Top Actions */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.85rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>
                {activeTemplate?.name || "Email Template"}
              </h3>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", fontFamily: "var(--font-mono)" }}>
                Key: {selectedKey} &bull; Stored in app_settings collection
              </span>
            </div>

            {/* Action Buttons: <> Code Viewer & Save Template */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <button
                type="button"
                onClick={() => setShowCodeModal(true)}
                style={{
                  padding: "0.55rem 0.9rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  color: "#009669",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ecfdf5")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                title="Edit Markdown & HTML Source Code (<>)"
              >
                <Code2 style={{ width: 17, height: 17 }} />
                <span>Source</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "0.55rem 1.4rem",
                  borderRadius: "8px",
                  backgroundColor: "#009669",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  boxShadow: "0 2px 6px rgba(0, 150, 105, 0.3)",
                }}
              >
                <Save style={{ width: 15, height: 15 }} />
                <span>{saving ? "Saving Template..." : "Save Template"}</span>
              </button>
            </div>
          </div>

          {/* Email Subject Input */}
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: "0.4rem" }}>
              Email Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "0.88rem",
                fontWeight: 600,
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "#ffffff",
              }}
            />
          </div>

          {/* Variable Tag Display Badges */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
              Available Template Placeholders
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {(placeholders.length > 0 ? placeholders : ["name", "email", "invite_link", "expires_hours"]).map((varName) => (
                <span
                  key={varName}
                  style={{
                    padding: "0.3rem 0.65rem",
                    borderRadius: "6px",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    color: "#475569",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontFamily: "var(--font-mono)",
                    cursor: "default",
                    userSelect: "text",
                  }}
                  title={`Supported variable: {{${varName}}}`}
                >
                  <Tag style={{ width: 12, height: 12, color: "#64748b" }} />
                  <span>{`{{${varName}}}`}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Main View: Live Email Render (Colors & Buttons) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>
                Live Email Render
              </label>
              <Sparkles style={{ width: 15, height: 15, color: "#009669" }} />
            </div>
            
            <div
              style={{ padding: "1.5rem", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px dashed #cbd5e1", minHeight: "350px" }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("a") || target.closest("button") || target.closest("form")) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <div
                style={{ width: "100%" }}
                dangerouslySetInnerHTML={{
                  __html: previewData?.html_rendered || "<p style='color:#94a3b8;'>Rendering live email...</p>",
                }}
              />
            </div>
          </div>

          <div style={{ fontSize: "0.72rem", color: "#94a3b8", textAlign: "right", fontFamily: "var(--font-mono)" }}>
            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "System Default"}
          </div>

        </div>

      </div>

      {/* POPUP MODAL: Markdown & HTML Source Code (<>) */}
      {showCodeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "800px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Code2 style={{ width: 20, height: 20, color: "#009669" }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                    Markdown & HTML Source Code (&lt;&gt;)
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Edit template source, custom HTML buttons, inline colors, and placeholders.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                style={{ padding: "0.4rem", borderRadius: "6px", border: "none", backgroundColor: "transparent", color: "#64748b", cursor: "pointer" }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Modal Body: Single Minimal Textarea Field */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                Source Text (Markdown + HTML Buttons & Styles)
              </label>
              <textarea
                value={bodyMarkdown}
                onChange={(e) => handleBodyChange(e.target.value)}
                rows={16}
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "10px",
                  backgroundColor: "#f8fafc",
                  color: "#0f172a",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  outline: "none",
                  border: "1px solid #d1d5db",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>


            {/* Modal Footer */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                style={{ padding: "0.55rem 1rem", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
              >
                Done
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "0.55rem 1.35rem",
                  borderRadius: "8px",
                  backgroundColor: "#009669",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  boxShadow: "0 2px 6px rgba(0, 150, 105, 0.3)",
                }}
              >
                <Save style={{ width: 15, height: 15 }} />
                <span>{saving ? "Saving..." : "Save Template"}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
