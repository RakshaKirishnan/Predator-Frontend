"use client";

import React, { useState } from "react";
import { Plus, RefreshCw, Search, Pencil } from "lucide-react";
import { MemberItem } from "../../types/members.types";
import { EditMemberModal } from "./EditMemberModal";

interface MembersViewProps {
  members: MemberItem[];
  currentUserRole?: string;
  onOpenInvite: () => void;
  onRefresh: () => void;
}

export function MembersView({
  members,
  currentUserRole,
  onOpenInvite,
  onRefresh,
}: MembersViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);

  const isSuperAdmin = currentUserRole?.trim().toUpperCase() === "SUPER_ADMIN";

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827", fontFamily: "var(--font-archivo-black)" }}>
            Members Management
          </h1>
          <p style={{ margin: "0.2rem 0 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
            Enrolled facial biometric user accounts & access control roles
          </p>
        </div>

        {/* Top Right Utilities: Refresh & + Invite User */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={onRefresh}
            style={{
              padding: "0.55rem",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#4b5563",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            }}
            title="Refresh Members"
          >
            <RefreshCw style={{ width: "16px", height: "16px" }} />
          </button>

          <button
            onClick={onOpenInvite}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              backgroundColor: "#009669",
              color: "#ffffff",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 2px 4px rgba(0, 150, 105, 0.2)",
              transition: "all 0.2s ease",
            }}
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            <span>Invite User</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ padding: "1.25rem", borderRadius: "12px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#9ca3af" }} />
          <input
            type="text"
            placeholder="Search members by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem 0.6rem 2.5rem",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "0.85rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
          {filteredMembers.length} Members Enrolled
        </span>
      </div>

      {/* Members Table */}
      <div style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", color: "#4b5563", fontWeight: 700 }}>
                <th style={{ padding: "0.85rem 1rem" }}>User Details</th>
                <th style={{ padding: "0.85rem 1rem" }}>Role</th>
                <th style={{ padding: "0.85rem 1rem" }}>Biometrics Status</th>
                <th style={{ padding: "0.85rem 1rem" }}>Enrolled Date</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "right", width: "90px" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "3rem 0", color: "#9ca3af", fontStyle: "italic" }}>
                    No enrolled members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  let roleBg = "#f3f4f6";
                  let roleColor = "#374151";

                  if (m.role === "SUPER_ADMIN") {
                    roleBg = "#fef3c7";
                    roleColor = "#92400e";
                  } else if (m.role === "ADMIN") {
                    roleBg = "#e0e7ff";
                    roleColor = "#3730a3";
                  }

                  return (
                    <tr
                      key={m.user_id}
                      style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#e0e7ff", color: "#3730a3", display: "grid", placeItems: "center", fontWeight: 700, fontSize: "0.9rem" }}>
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ display: "block", color: "#111827" }}>{m.name}</strong>
                            <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>{m.email}</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "0.25rem 0.65rem",
                            borderRadius: "9999px",
                            backgroundColor: roleBg,
                            color: roleColor,
                            letterSpacing: "0.03em",
                          }}
                        >
                          {m.role}
                        </span>
                      </td>

                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                          <span style={{ fontSize: "0.8rem", color: "#065f46", fontWeight: 600 }}>Active (512D Vector)</span>
                        </div>
                      </td>

                      <td style={{ padding: "0.85rem 1rem", color: "#6b7280", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                        {m.created_at ? String(m.created_at).replace("T", " ").split("+")[0].substring(0, 19) : "N/A"}
                      </td>

                      <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                        <button
                          disabled={!isSuperAdmin}
                          onClick={() => isSuperAdmin && setEditingMember(m)}
                          style={{
                            padding: "0.4rem 0.65rem",
                            borderRadius: "6px",
                            border: isSuperAdmin ? "1px solid #d1d5db" : "1px solid #e5e7eb",
                            backgroundColor: isSuperAdmin ? "#ffffff" : "#f3f4f6",
                            color: isSuperAdmin ? "#009669" : "#9ca3af",
                            cursor: isSuperAdmin ? "pointer" : "not-allowed",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            opacity: isSuperAdmin ? 1 : 0.65,
                            boxShadow: isSuperAdmin ? "0 1px 2px rgba(0, 0, 0, 0.05)" : "none",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (isSuperAdmin) e.currentTarget.style.backgroundColor = "#ecfdf5";
                          }}
                          onMouseLeave={(e) => {
                            if (isSuperAdmin) e.currentTarget.style.backgroundColor = "#ffffff";
                          }}
                          title={isSuperAdmin ? "Edit Member Credentials & Role (Super Admin)" : "Edit disabled — Requires SUPER_ADMIN role"}
                        >
                          <Pencil style={{ width: "13px", height: "13px" }} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>


          </table>
        </div>
      </div>

      {/* Edit Member Popup Modal */}
      <EditMemberModal
        member={editingMember}
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        onSuccess={onRefresh}
      />
    </div>
  );
}

