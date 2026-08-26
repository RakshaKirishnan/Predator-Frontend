"use client";

import React, { useState } from "react";
import { UserPlus, X, AlertCircle, Copy, Check } from "lucide-react";
import { membersService } from "../../services/membersService";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  currentUserRole?: string;
}

export function InviteUserModal({ isOpen, onClose, onSuccess, currentUserRole }: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [smtpWarning, setSmtpWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canInviteSuperAdmin = currentUserRole === "SUPER_ADMIN";


  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    setGeneratedLink(null);
    setSmtpWarning(null);

    try {
      const res = await membersService.sendInvite({ email, name, role });
      const data = res.data as any;

      if (data && data.email_sent === false) {
        setGeneratedLink(data.invite_link);
        setSmtpWarning("SMTP Limit Exceeded (Gmail 550 Daily Quota). You can copy the generated invitation link below:");
      } else {
        onSuccess(email);
        resetForm();
        onClose();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send invite";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setName("");
    setRole("ADMIN");
    setGeneratedLink(null);
    setSmtpWarning(null);
    setError("");
    setCopied(false);
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={() => { resetForm(); onClose(); }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f9fafb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <UserPlus style={{ width: "20px", height: "20px", color: "#009669" }} />
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>Invite User</h3>
          </div>
          <button
            onClick={() => { resetForm(); onClose(); }}
            style={{ padding: "0.35rem", borderRadius: "6px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#6b7280", cursor: "pointer" }}
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {error && (
            <div style={{ padding: "0.75rem 1rem", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#991b1b", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {smtpWarning && (
            <div style={{ padding: "0.85rem 1rem", backgroundColor: "#fffbebf5", border: "1px solid #fcd34d", borderRadius: "8px", color: "#92400e", fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700 }}>
                <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, color: "#d97706" }} />
                <span>{smtpWarning}</span>
              </div>

              {generatedLink && (
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    style={{
                      flex: 1,
                      padding: "0.45rem 0.65rem",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.78rem",
                      fontFamily: "var(--font-mono)",
                      backgroundColor: "#ffffff",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      padding: "0.45rem 0.85rem",
                      borderRadius: "6px",
                      backgroundColor: "#009669",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {!generatedLink && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: "0.4rem" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. member@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: "0.4rem" }}>
                  Username / Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raksha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />

              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: "0.4rem" }}>
                  Assigned Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.88rem",
                    backgroundColor: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="USER">User (Standard Access)</option>
                  <option value="ADMIN">Admin (Console Manager)</option>
                  {canInviteSuperAdmin && (
                    <option value="SUPER_ADMIN">Super Admin (Full System Access)</option>
                  )}
                </select>

              </div>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={() => { resetForm(); onClose(); }}
              style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#ffffff", color: "#374151", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
            >
              {generatedLink ? "Close" : "Cancel"}
            </button>
            {!generatedLink && (
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "8px",
                  backgroundColor: "#009669",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 4px rgba(0, 150, 105, 0.2)",
                }}
              >
                {submitting ? "Sending Invite..." : "Send Invitation"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
