"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  ChevronsRight,
  TrendingUp,
  Activity,
  Package,
  Settings,
  HelpCircle,
  User,
  FileText,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Eye,
  X,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";


import { dashboardService } from "../../services/dashboardService";
import { membersService } from "../../services/membersService";
import { DashboardCardsData, UsageLog } from "../../types/dashboard.types";
import { MemberItem } from "../../types/members.types";
import { MembersView } from "../../components/members/MembersView";
import { InviteUserModal } from "../../components/members/InviteUserModal";
import { EmailTemplateEditor } from "../../components/settings/EmailTemplateEditor";
import { HelpSupportView } from "../../components/help/HelpSupportView";

export default function Dashboard() {



  const router = useRouter();
  const [stats, setStats] = useState<DashboardCardsData>({
    users: 0,
    pending_invites: 0,
    accepted_invites: 0,
    total_invites: 0,
  });
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [logLimit] = useState(10);
  const [healthStatus, setHealthStatus] = useState<{
    success: boolean;
    engine_ready?: boolean;
    model?: string;
  } | null>(null);

  const [userProfile, setUserProfile] = useState<{ name: string; email: string; role: string } | null>(null);
  const [selectedTab, setSelectedTab] = useState("Dashboard");
  const [selectedLog, setSelectedLog] = useState<UsageLog | null>(null);
  
  // Invite Modal & Toast state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load user session from cookie
  const fetchUser = useCallback(async () => {
    try {
      const user = await dashboardService.getCurrentUser();
      setUserProfile(user);
    } catch (err) {
      console.warn("Unauthenticated session or missing cookie", err);
    }
  }, []);

  // Load stats, logs, health, and members
  const fetchStats = useCallback(async () => {
    try {
      const data = await dashboardService.getDashboardCards();
      setStats(data);
    } catch (err) {
      console.error("Failed to load cards stats", err);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await dashboardService.getUsageLogs(logPage, logLimit);
      setLogs(data.logs);
      setTotalLogs(data.total);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    }
  }, [logPage, logLimit]);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await membersService.getMembers();
      setMembers(data.members);
    } catch (err) {
      console.error("Failed to load members list", err);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const data = await dashboardService.getHealthStatus();
      setHealthStatus({
        success: true,
        engine_ready: data.engine_ready,
        model: data.model,
      });
    } catch (err) {
      setHealthStatus({ success: false });
    }
  }, []);

  useEffect(() => {
    void fetchUser();
    void fetchStats();
    void fetchLogs();
    void fetchMembers();
    void fetchHealth();
  }, [fetchUser, fetchStats, fetchLogs, fetchMembers, fetchHealth]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await dashboardService.logout();
    } catch (err) {
      console.error("Failed to execute logout", err);
    }
    router.push("/");
  };

  // Toast Auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleInviteSuccess = (invitedEmail: string) => {
    setToastMessage(`Onboarding invitation sent successfully via SMTP to ${invitedEmail}!`);
    void fetchMembers();
    void fetchStats();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: "#f9fafb", color: "#111827" }}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            backgroundColor: "#065f46",
            color: "#ecfdf5",
            border: "1px solid #10b981",
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
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
          <button onClick={() => setToastMessage(null)} style={{ background: "transparent", border: "none", color: "#ecfdf5", cursor: "pointer" }}>
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      )}

      {/* Collapsible Sidebar */}
      <Sidebar selected={selectedTab} setSelected={setSelectedTab} stats={stats} onLogout={handleLogout} userProfile={userProfile} />
      
      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {selectedTab === "Members" ? (
          <MembersView 
            members={members} 
            currentUserRole={userProfile?.role}
            onOpenInvite={() => setShowInviteModal(true)} 
            onRefresh={() => { void fetchMembers(); void fetchUser(); }}
          />
        ) : selectedTab === "Settings" ? (
          <EmailTemplateEditor />
        ) : selectedTab === "Help & Support" ? (
          <HelpSupportView />
        ) : (
          <DashboardContentView 
            stats={stats} 
            logs={logs} 
            logPage={logPage} 
            setLogPage={setLogPage} 
            totalLogs={totalLogs} 
            logLimit={logLimit}
            healthStatus={healthStatus}
            userProfile={userProfile}
            onRefresh={() => { void fetchUser(); void fetchStats(); void fetchLogs(); void fetchHealth(); }}
            selectedLog={selectedLog}
            setSelectedLog={setSelectedLog}
          />
        )}


      </div>

      {/* Modular Invite User Modal Dialog */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={handleInviteSuccess}
        currentUserRole={userProfile?.role || "USER"}
      />

    </div>
  );
}

// Sidebar Component
const Sidebar = ({ selected, setSelected, stats, onLogout, userProfile }: { selected: string; setSelected: (t: string) => void; stats: DashboardCardsData; onLogout: () => void; userProfile?: { name: string; email: string; role: string } | null }) => {
  const [open, setOpen] = useState(true);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
        borderRight: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        padding: "0.5rem",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        boxSizing: "border-box",
        width: open ? "16rem" : "4rem",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        zIndex: 50,
      }}
    >
      <div>
        <TitleSection open={open} userProfile={userProfile} />

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "2rem" }}>
          <Option
            Icon={Home}
            title="Dashboard"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={Users}
            title="Members"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />

        </div>

        {open && (
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Account Settings
            </div>
            <Option
              Icon={Settings}
              title="Settings"
              selected={selected}
              setSelected={setSelected}
              open={open}
            />
            <Option
              Icon={HelpCircle}
              title="Help & Support"
              selected={selected}
              setSelected={setSelected}
              open={open}
            />
          </div>
        )}
      </div>

      <div>
        {open && userProfile && (
          <div style={{ margin: "0.5rem", padding: "0.75rem", borderRadius: "8px", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#009669", color: "#ffffff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: "0.85rem" }}>
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userProfile.name}</div>
              <div style={{ fontSize: "0.7rem", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userProfile.role}</div>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "transparent",
            color: "#ef4444",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "0.5rem",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <LogOut style={{ width: "18px", height: "18px" }} />
          {open && <span>Logout</span>}
        </button>

        <ToggleClose open={open} setOpen={setOpen} />
      </div>
    </nav>
  );
};

const Option = ({
  Icon,
  title,
  selected,
  setSelected,
  open,
  notifs,
}: {
  Icon: React.ElementType;
  title: string;
  selected: string;
  setSelected: (t: string) => void;
  open: boolean;
  notifs?: number;
}) => {
  const isSelected = selected === title;

  return (
    <button
      onClick={() => setSelected(title)}
      style={{
        position: "relative",
        display: "flex",
        height: "2.5rem",
        width: "100%",
        alignItems: "center",
        borderRadius: "8px",
        border: "none",
        backgroundColor: isSelected ? "#ecfdf5" : "transparent",
        color: isSelected ? "#009669" : "#4b5563",
        fontSize: "0.875rem",
        fontWeight: isSelected ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.2s ease",
        padding: "0 0.75rem",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = "#f3f4f6";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div style={{ display: "grid", placeItems: "center", width: "1.5rem" }}>
        <Icon style={{ width: "18px", height: "18px" }} />
      </div>

      {open && (
        <span style={{ marginLeft: "0.75rem", transition: "opacity 0.2s ease", flex: 1, textAlign: "left" }}>
          {title}
        </span>
      )}

      {open && notifs !== undefined && notifs > 0 && (
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "0.15rem 0.4rem",
            borderRadius: "9999px",
            backgroundColor: isSelected ? "#009669" : "#e5e7eb",
            color: isSelected ? "#ffffff" : "#374151",
          }}
        >
          {notifs}
        </span>
      )}
    </button>
  );
};

const TitleSection = ({ open, userProfile }: { open: boolean; userProfile?: { name: string; email: string; role: string } | null }) => {
  return (
    <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#009669", display: "grid", placeItems: "center", color: "#ffffff", fontWeight: 800 }}>
          P
        </div>
        {open && (
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111827", letterSpacing: "0.05em", fontFamily: "var(--font-archivo-black)" }}>
              PREDATOR
            </div>
            <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 500 }}>
              Face Security Console
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ToggleClose = ({ open, setOpen }: { open: boolean; setOpen: (b: boolean) => void }) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5rem",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "transparent",
        color: "#9ca3af",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <ChevronsRight style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s", width: "18px", height: "18px" }} />
    </button>
  );
};

// Dashboard Main Content View
const DashboardContentView = ({
  stats,
  logs,
  logPage,
  setLogPage,
  totalLogs,
  logLimit,
  healthStatus,
  userProfile,
  onRefresh,
  selectedLog,
  setSelectedLog,
}: {
  stats: DashboardCardsData;
  logs: UsageLog[];
  logPage: number;
  setLogPage: React.Dispatch<React.SetStateAction<number>>;
  totalLogs: number;
  logLimit: number;
  healthStatus: { success: boolean; engine_ready?: boolean; model?: string } | null;
  userProfile?: { name: string; email: string; role: string } | null;
  onRefresh: () => void;
  selectedLog: UsageLog | null;
  setSelectedLog: (log: UsageLog | null) => void;
}) => {
  const totalPages = Math.ceil(totalLogs / logLimit) || 1;

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827", fontFamily: "var(--font-archivo-black)" }}>
            Biometrics Console Overview
          </h1>
          <p style={{ margin: "0.2rem 0 0 0", color: "#6b7280", fontSize: "0.9rem" }}>Enterprise biometrics security controls & audits</p>
        </div>
        
        {/* Header Right Utilities (Refresh & User Profile buttons only) */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button 
            onClick={onRefresh}
            style={{
              padding: "0.5rem",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#4b5563",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
            title="Refresh Data"
          >
            <RefreshCw style={{ width: "16px", height: "16px" }} />
          </button>
          
          <button style={{ padding: "0.5rem", borderRadius: "8px", backgroundColor: "#ffffff", border: "1px solid #e5e7eb", color: "#4b5563", cursor: "pointer", display: "flex", alignItems: "center", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                  title={userProfile?.name ? `User: ${userProfile.name}` : "User Profile"}>
            <User style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      </div>

      {/* 4 Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        
        {/* Card 1: Users Enrolled */}
        <div style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ padding: "0.5rem", backgroundColor: "#d1fae5", borderRadius: "8px", color: "#059669", display: "grid", placeItems: "center" }}>
              <ShieldCheck style={{ width: "20px", height: "20px" }} />
            </div>
            <TrendingUp style={{ width: "16px", height: "16px", color: "#10b981" }} />
          </div>
          <div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Users Enrolled</h3>
            <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#111827" }}>{stats.users}</p>
          </div>
        </div>

        {/* Card 2: Pending Invites */}
        <div style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ padding: "0.5rem", backgroundColor: "#fef3c7", borderRadius: "8px", color: "#d97706", display: "grid", placeItems: "center" }}>
              <Activity style={{ width: "20px", height: "20px" }} />
            </div>
            <TrendingUp style={{ width: "16px", height: "16px", color: "#10b981" }} />
          </div>
          <div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pending Invites</h3>
            <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#111827" }}>{stats.pending_invites}</p>
          </div>
        </div>

        {/* Card 3: Accepted Invites */}
        <div style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ padding: "0.5rem", backgroundColor: "#dbeafe", borderRadius: "8px", color: "#2563eb", display: "grid", placeItems: "center" }}>
              <User style={{ width: "20px", height: "20px" }} />
            </div>
            <TrendingUp style={{ width: "16px", height: "16px", color: "#10b981" }} />
          </div>
          <div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Accepted Invites</h3>
            <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#111827" }}>{stats.accepted_invites}</p>
          </div>
        </div>

        {/* Card 4: Total Invites */}
        <div style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ padding: "0.5rem", backgroundColor: "#e0e7ff", borderRadius: "8px", color: "#4f46e5", display: "grid", placeItems: "center" }}>
              <Package style={{ width: "20px", height: "20px" }} />
            </div>
            <TrendingUp style={{ width: "16px", height: "16px", color: "#10b981" }} />
          </div>
          <div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Invites</h3>
            <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#111827" }}>{stats.total_invites}</p>
          </div>
        </div>
      </div>

      {/* System Access Audit Logs Table */}
      <div style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.75rem", flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText style={{ width: "18px", height: "18px", color: "#6b7280" }} />
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>System Access Audit Logs</h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#6b7280", background: "#f3f4f6", padding: "0.25rem 0.5rem", borderRadius: "6px", fontFamily: "var(--font-mono)" }}>
            {totalLogs} Events Captured
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", color: "#4b5563", fontWeight: 700 }}>
                <th style={{ padding: "0.75rem 1rem" }}>Timestamp (IST)</th>
                <th style={{ padding: "0.75rem 1rem" }}>User Details</th>
                <th style={{ padding: "0.75rem 1rem" }}>Event Action</th>
                <th style={{ padding: "0.75rem 1rem" }}>IP Address</th>
                <th style={{ padding: "0.75rem 1rem" }}>Resolved Location</th>
                <th style={{ padding: "0.75rem 1rem" }}>Summary</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: "var(--font-mono)" }}>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2.5rem 0", color: "#9ca3af", fontStyle: "italic" }}>
                    No login / logout activity has been recorded in the database.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  let badgeBg = "#f3f4f6";
                  let badgeColor = "#4b5563";
                  if (log.action === "LOGIN") {
                    badgeBg = "#d1fae5";
                    badgeColor = "#065f46";
                  } else if (log.action === "SIGNUP") {
                    badgeBg = "#dbeafe";
                    badgeColor = "#1e40af";
                  } else if (log.action === "LOGOUT") {
                    badgeBg = "#fee2e2";
                    badgeColor = "#991b1b";
                  }

                  const formattedTs = log.timestamp
                    ? String(log.timestamp).replace("T", " ").split("+")[0].split(".")[0]
                    : "N/A";

                  return (
                    <tr 
                      key={log.log_id} 
                      style={{ borderBottom: "1px solid #f3f4f6", color: "#374151", transition: "background 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "0.75rem 1rem", color: "#009669", fontWeight: 600 }}>
                        {formattedTs}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <strong style={{ display: "block", color: "#111827" }}>{log.username}</strong>
                        <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>{log.email}</span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          backgroundColor: badgeBg,
                          color: badgeColor,
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>{log.ip_address}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#2563eb", fontWeight: 600 }}>{log.location}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <button
                          onClick={() => setSelectedLog(log)}
                          style={{
                            padding: "0.35rem 0.65rem",
                            borderRadius: "6px",
                            border: "1px solid #d1d5db",
                            backgroundColor: "#ffffff",
                            color: "#2563eb",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                          title="View full User-Agent details"
                        >
                          <Eye style={{ width: "14px", height: "14px" }} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalLogs > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
            <button
              disabled={logPage === 1}
              onClick={() => setLogPage((prev) => Math.max(1, prev - 1))}
              className="btn-secondary"
              style={{ padding: "0.4rem 0.8rem", color: logPage === 1 ? "#9ca3af" : "#374151" }}
            >
              &larr; Previous
            </button>
            
            <span style={{ fontSize: "0.78rem", color: "#4b5563", fontFamily: "var(--font-mono)" }}>
              Page <strong>{logPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              disabled={logPage >= totalPages}
              onClick={() => setLogPage((prev) => Math.min(totalPages, prev + 1))}
              className="btn-secondary"
              style={{ padding: "0.4rem 0.8rem", color: logPage >= totalPages ? "#9ca3af" : "#374151" }}
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>

      {/* User-Agent Modal Popup Overlay */}
      {selectedLog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: "1rem",
          }}
          onClick={() => setSelectedLog(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "540px",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f9fafb" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#111827" }}>Device User-Agent</h3>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.75rem", color: "#6b7280" }}>
                  Log Entry for <strong>{selectedLog.username}</strong> ({selectedLog.ip_address})
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ padding: "0.35rem", borderRadius: "6px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#6b7280", cursor: "pointer", display: "grid", placeItems: "center" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Captured Unregistered Face Snapshot Card */}
              {selectedLog.captured_face_image && (
                <div style={{ padding: "1rem", borderRadius: "12px", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#991b1b", fontSize: "0.78rem", fontWeight: 700 }}>
                    <ShieldAlert style={{ width: 16, height: 16, color: "#dc2626" }} />
                    <span>Captured Unregistered Face Snapshot</span>
                  </div>
                  <img
                    src={selectedLog.captured_face_image.startsWith("data:") ? selectedLog.captured_face_image : `data:image/jpeg;base64,${selectedLog.captured_face_image}`}
                    alt="Captured Unregistered Face"
                    style={{
                      maxWidth: "260px",
                      maxHeight: "260px",
                      borderRadius: "10px",
                      border: "2px solid #ef4444",
                      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
                      objectFit: "cover",
                    }}
                  />
                  <span style={{ fontSize: "0.72rem", color: "#7f1d1d", fontStyle: "italic" }}>
                    Biometric scan failed to match any enrolled user profile.
                  </span>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                  Full User-Agent String
                </label>
                <div style={{
                  padding: "1rem",
                  borderRadius: "8px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: "#1f2937",
                  wordBreak: "break-all",
                  lineHeight: 1.5,
                  userSelect: "all"
                }}>
                  {selectedLog.user_agent || "No User-Agent string available"}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.78rem", color: "#4b5563" }}>
                <div>
                  <span style={{ color: "#6b7280" }}>Event Action: </span>
                  <strong style={{ color: selectedLog.action.includes("FAILED") ? "#dc2626" : "#111827" }}>{selectedLog.action}</strong>
                </div>
                <div>
                  <span style={{ color: "#6b7280" }}>Location: </span>
                  <strong style={{ color: "#2563eb" }}>{selectedLog.location}</strong>
                </div>
              </div>
            </div>


            {/* Modal Footer */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", backgroundColor: "#f9fafb" }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#ffffff", color: "#374151", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
