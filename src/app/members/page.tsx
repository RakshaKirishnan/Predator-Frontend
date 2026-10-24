"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { MembersView } from "../../components/members/MembersView";
import { InviteUserModal } from "../../components/members/InviteUserModal";
import { membersService } from "../../services/membersService";
import { dashboardService } from "../../services/dashboardService";
import { MemberItem } from "../../types/members.types";
import { CheckCircle2, X } from "lucide-react";

export default function MembersPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await membersService.getMembers();
      setMembers(data.members || []);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const user = await dashboardService.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error("Failed to load user:", err);
    }
  }, []);

  useEffect(() => {
    void fetchMembers();
    void fetchUser();
  }, [fetchMembers, fetchUser]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleInviteSuccess = (invitedEmail: string) => {
    setToastMessage(`Invitation successfully dispatched to ${invitedEmail}!`);
    void fetchMembers();
  };

  return (
    <AppShell activeTab="Members" userProfile={currentUser}>
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            backgroundColor: "#065f46",
            color: "#ecfdf5",
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          <CheckCircle2 style={{ width: "20px", height: "20px", color: "#34d399" }} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: "transparent", border: "none", color: "#ecfdf5", cursor: "pointer" }}
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      )}

      <MembersView
        members={members}
        currentUserRole={currentUser?.role}
        onOpenInvite={() => setShowInviteModal(true)}
        onRefresh={() => {
          void fetchMembers();
          void fetchUser();
        }}
      />

      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={handleInviteSuccess}
      />
    </AppShell>
  );
}
