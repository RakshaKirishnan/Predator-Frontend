"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronsRight,
} from "lucide-react";
import { dashboardService } from "../../services/dashboardService";
import { clearAuthSession } from "../../lib/apiConfig";

export interface AppShellProps {
  children: React.ReactNode;
  activeTab: "Dashboard" | "Members" | "Settings" | "Help & Support";
  userProfile?: { name: string; email: string; role: string } | null;
  onRefresh?: () => void;
}

export function AppShell({ children, activeTab, userProfile: initialProfile }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [profile, setProfile] = useState<{ name: string; email: string; role: string } | null>(
    initialProfile || null
  );
  const [isValidating, setIsValidating] = useState(!initialProfile);

  // Validate active session per page
  useEffect(() => {
    let isMounted = true;
    dashboardService
      .getCurrentUser()
      .then((user) => {
        if (isMounted) {
          setProfile(user);
          setIsValidating(false);
        }
      })
      .catch((err) => {
        console.warn("Unauthorized session, redirecting to login:", err);
        clearAuthSession();
        router.replace("/");
      });

    return () => {
      isMounted = false;
    };
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      await dashboardService.logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      clearAuthSession();
      router.replace("/");
    }
  };

  const handleNavigate = (tab: "Dashboard" | "Members" | "Settings" | "Help & Support") => {
    switch (tab) {
      case "Dashboard":
        router.push("/dashboard");
        break;
      case "Members":
        router.push("/members");
        break;
      case "Settings":
        router.push("/settings");
        break;
      case "Help & Support":
        router.push("/help");
        break;
    }
  };

  if (isValidating && !profile) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
          color: "#009669",
          fontFamily: "var(--font-inter), sans-serif",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid #e5e7eb",
            borderTopColor: "#009669",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#4b5563" }}>
          Authenticating secure session...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: "#f9fafb", color: "#111827" }}>
      {/* Sticky Collapsible Sidebar */}
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
          {/* Logo Title Section */}
          <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "#009669",
                  display: "grid",
                  placeItems: "center",
                  color: "#ffffff",
                  fontWeight: 800,
                }}
              >
                P
              </div>
              {open && (
                <div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#111827",
                      letterSpacing: "0.05em",
                      fontFamily: "var(--font-archivo-black)",
                    }}
                  >
                    PREDATOR
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 500 }}>
                    Face Security Console
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Primary Navigation */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "2rem" }}>
            <NavOption
              Icon={Home}
              title="Dashboard"
              active={activeTab === "Dashboard"}
              onClick={() => handleNavigate("Dashboard")}
              open={open}
            />
            <NavOption
              Icon={Users}
              title="Members"
              active={activeTab === "Members"}
              onClick={() => handleNavigate("Members")}
              open={open}
            />
          </div>

          {/* Secondary Account Navigation */}
          {open && (
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <div
                style={{
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Account Settings
              </div>
              <NavOption
                Icon={Settings}
                title="Settings"
                active={activeTab === "Settings"}
                onClick={() => handleNavigate("Settings")}
                open={open}
              />
              <NavOption
                Icon={HelpCircle}
                title="Help & Support"
                active={activeTab === "Help & Support"}
                onClick={() => handleNavigate("Help & Support")}
                open={open}
              />
            </div>
          )}
        </div>

        {/* User Profile Badge & Logout */}
        <div>
          {open && profile && (
            <div
              style={{
                margin: "0.5rem",
                padding: "0.75rem",
                borderRadius: "8px",
                backgroundColor: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#009669",
                  color: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#111827",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {profile.name}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#6b7280",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {profile.role}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            id="sidebar-logout-btn"
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
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <LogOut style={{ width: "18px", height: "18px" }} />
            {open && <span>Logout</span>}
          </button>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle Sidebar"
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
            <ChevronsRight
              style={{
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform 0.3s",
                width: "18px",
                height: "18px",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Main Page Content Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}

function NavOption({
  Icon,
  title,
  active,
  onClick,
  open,
}: {
  Icon: React.ElementType;
  title: string;
  active: boolean;
  onClick: () => void;
  open: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        height: "2.5rem",
        width: "100%",
        alignItems: "center",
        borderRadius: "8px",
        border: "none",
        backgroundColor: active ? "#ecfdf5" : "transparent",
        color: active ? "#009669" : "#4b5563",
        fontSize: "0.875rem",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.2s ease",
        padding: "0 0.75rem",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = "#f3f4f6";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = "transparent";
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
    </button>
  );
}
