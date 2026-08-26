"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, X, AlertCircle, Save, UserCheck } from "lucide-react";
import { MemberItem } from "../../types/members.types";
import { membersService } from "../../services/membersService";

interface EditMemberModalProps {
  member: MemberItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditMemberModal({
  member,
  isOpen,
  onClose,
  onSuccess,
}: EditMemberModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (member) {
      setName(member.name || "");
      setEmail(member.email || "");
      setRole(member.role || "USER");
      setError("");
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and Email address cannot be empty.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await membersService.updateMember(member.user_id, {
        name: name.trim(),
        email: email.trim(),
        role: role.trim().toUpperCase(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update member credentials";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f9fafb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div style={{ width: 34, height: 34, borderRadius: "8px", backgroundColor: "#ecfdf5", border: "1px solid #10b981", display: "grid", placeItems: "center" }}>
              <UserCheck style={{ width: "18px", height: "18px", color: "#009669" }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#111827", fontFamily: "var(--font-archivo-black)" }}>
                Edit Member & Role
              </h3>
              <p style={{ margin: "0.1rem 0 0 0", fontSize: "0.72rem", color: "#6b7280", fontWeight: 600 }}>
                RBAC Authorization: <span style={{ color: "#d97706" }}>SUPER_ADMIN ONLY</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
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

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: "0.4rem" }}>
              Full Name / Username
            </label>
            <input
              type="text"
              required
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
              Email Address
            </label>
            <input
              type="email"
              required
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
              Assigned Role (RBAC)
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
                fontWeight: 600,
              }}
            >
              <option value="USER">User (Standard Access)</option>
              <option value="ADMIN">Admin (Console Manager)</option>
              <option value="SUPER_ADMIN">Super Admin (Full System Access)</option>
            </select>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#ffffff", color: "#374151", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
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
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: "0 2px 4px rgba(0, 150, 105, 0.25)",
              }}
            >
              <Save style={{ width: 15, height: 15 }} />
              <span>{submitting ? "Updating..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
