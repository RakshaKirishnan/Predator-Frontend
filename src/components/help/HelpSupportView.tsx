"use client";

import React from "react";
import {
  HelpCircle,
  Mail,
  UserCheck,
  Shield,
  KeyRound,
  ExternalLink,
  BookOpen,
  Cpu,
  CheckCircle2,
  Lock,
} from "lucide-react";

export function HelpSupportView() {
  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <HelpCircle style={{ width: 24, height: 24, color: "#009669" }} />
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827", fontFamily: "var(--font-archivo-black)" }}>
            Help & Support Center
          </h1>
        </div>
        <p style={{ margin: "0.3rem 0 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
          Official technical support contacts, system documentation, and facial biometric operational guidelines.
        </p>
      </div>

      {/* Official Technical Contacts Section */}
      <div>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em", marginBottom: "0.85rem" }}>
          Official System Contacts
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {/* Owner / Developer Card */}
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "14px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, right: 0, width: "90px", height: "90px", backgroundColor: "#ecfdf5", borderRadius: "0 0 0 100px", pointerEvents: "none", zIndex: 0 }} />
            
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", zIndex: 1 }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "#009669",
                  color: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  boxShadow: "0 4px 10px rgba(0,150,105,0.25)",
                }}
              >
                R
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#009669", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Owner / Lead Developer
                </div>
                <h3 style={{ margin: "0.1rem 0 0 0", fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>
                  Raksha Kirishnan
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  System Owner & Lead Architect
                </span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#374151", fontSize: "0.85rem", fontWeight: 600 }}>
                <Mail style={{ width: 15, height: 15, color: "#009669" }} />
                <span>rakshakirish07@gmail.com</span>
              </div>
              <a
                href="mailto:rakshakirish07@gmail.com"
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: "6px",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#047857",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  transition: "all 0.2s",
                }}
              >
                <span>Contact</span>
                <ExternalLink style={{ width: 12, height: 12 }} />
              </a>
            </div>
          </div>

          {/* Teammate Card */}
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "14px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, right: 0, width: "90px", height: "90px", backgroundColor: "#e0e7ff", borderRadius: "0 0 0 100px", pointerEvents: "none", zIndex: 0 }} />
            
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", zIndex: 1 }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "#4f46e5",
                  color: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  boxShadow: "0 4px 10px rgba(79,70,229,0.25)",
                }}
              >
                A
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Core Teammate
                </div>
                <h3 style={{ margin: "0.1rem 0 0 0", fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>
                  Ashwin Chinnasamy
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  Core Engineer
                </span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#374151", fontSize: "0.85rem", fontWeight: 600 }}>
                <Mail style={{ width: 15, height: 15, color: "#4f46e5" }} />
                <span>ashwinchinnasamy@gmail.com</span>
              </div>
              <a
                href="mailto:ashwinchinnasamy@gmail.com"
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: "6px",
                  backgroundColor: "#e0e7ff",
                  border: "1px solid #c7d2fe",
                  color: "#3730a3",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  transition: "all 0.2s",
                }}
              >
                <span>Contact</span>
                <ExternalLink style={{ width: 12, height: 12 }} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Formal Documentation & Operational Guide */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        
        {/* Left Column: System Architecture & FAQ */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
            <BookOpen style={{ width: 18, height: 18, color: "#009669" }} />
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#111827" }}>
              PREDATOR System Documentation & Knowledge Base
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {/* FAQ 1 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "0.88rem", color: "#111827" }}>
                <Cpu style={{ width: 15, height: 15, color: "#009669" }} />
                <span>Facial Biometric Scan & Auto-Enrollment</span>
              </div>
              <p style={{ margin: "0.3rem 0 0 0", color: "#4b5563", fontSize: "0.83rem", lineHeight: 1.5 }}>
                PREDATOR uses MediaPipe for client-side face alignment detection and InsightFace (ResNet-50 ONNX) for generating 512-dimensional normalized biometric embeddings. Facial scans automatically enroll users without manual button triggers.
              </p>
            </div>

            {/* FAQ 2 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "0.88rem", color: "#111827" }}>
                <KeyRound style={{ width: 15, height: 15, color: "#009669" }} />
                <span>Email Invitation Link Verification</span>
              </div>
              <p style={{ margin: "0.3rem 0 0 0", color: "#4b5563", fontSize: "0.83rem", lineHeight: 1.5 }}>
                Account registration is strictly invitation-only. Admins send secure invitation links containing cryptographic tokens. Clicking the link opens the face enrollment camera directly.
              </p>
            </div>

            {/* FAQ 3 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "0.88rem", color: "#111827" }}>
                <Shield style={{ width: 15, height: 15, color: "#009669" }} />
                <span>Role-Based Access Control (RBAC)</span>
              </div>
              <p style={{ margin: "0.3rem 0 0 0", color: "#4b5563", fontSize: "0.83rem", lineHeight: 1.5 }}>
                `SUPER_ADMIN` holds full governance to manage member details, update user roles, and modify email templates in MongoDB (`app_settings`). `ADMIN` manages member invites and usage logs.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: System Diagnostics Card */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
            <Lock style={{ width: 18, height: 18, color: "#009669" }} />
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#111827" }}>
              Console Health & Status
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.83rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#6b7280" }}>Backend API Engine:</span>
              <span style={{ color: "#065f46", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <CheckCircle2 style={{ width: 14, height: 14, color: "#10b981" }} />
                FastAPI (PyTorch)
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#6b7280" }}>Database Storage:</span>
              <span style={{ color: "#111827", fontWeight: 700 }}>MongoDB (app_settings)</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#6b7280" }}>Embedding Dimension:</span>
              <span style={{ color: "#111827", fontWeight: 700, fontFamily: "var(--font-mono)" }}>512D Cosine Match</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#6b7280" }}>Support Response:</span>
              <span style={{ color: "#009669", fontWeight: 700 }}>24/7 Priority SLA</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
