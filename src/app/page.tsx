"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaceAuthClient } from "../api/face-auth-client";
import { FaceAuthCapture } from "../components/FaceAuthCapture";
import { BrandPanel } from "../components/auth/BrandPanel";
import { Mail, CheckCircle2, AlertCircle, Copy, ArrowRight, ExternalLink } from "lucide-react";

import { getApiBaseUrl } from "../lib/apiConfig";
import { dashboardService } from "../services/dashboardService";

export default function LoginPage() {
  const router = useRouter();
  const [baseUrl] = useState(getApiBaseUrl());

  const [errorMsg, setErrorMsg] = useState("");
  const [isDbEmpty, setIsDbEmpty] = useState(false);

  // Invite state for initial Super Admin setup
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  // Client instantiation
  const client = useRef(new FaceAuthClient({ baseUrl }));

  // Auto-redirect if already authenticated
  useEffect(() => {
    let isMounted = true;
    dashboardService
      .getCurrentUser()
      .then((user) => {
        if (isMounted && user) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        // Not authenticated, stay on login page
      });
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Check health and count users to see if DB is empty
  useEffect(() => {
    client.current = new FaceAuthClient({ baseUrl });
    const checkDbStatus = async () => {
      try {
        const res = await fetch(`${baseUrl}/dashboard/cards`);
        const body = await res.json();
        if (body.success && body.data.users === 0) {
          setIsDbEmpty(true);
        }
      } catch (err) {
        // Fallback
      }
    };
    void checkDbStatus();
  }, [baseUrl]);

  const handleSuccess = () => {
    setErrorMsg("");
    router.push("/dashboard");
  };

  const handleSendBootstrapInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    setSendingInvite(true);
    setErrorMsg("");
    setInviteLink(null);

    try {
      const res = await fetch(`${baseUrl}/auth/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName,
          role: "SUPER_ADMIN",
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.detail || body.message || "Failed to send invite");
      }
      setInviteSent(true);
      if (body.data?.invite_link) {
        setInviteLink(body.data.invite_link);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden", backgroundColor: "#0e1217" }}>
      {/* Full Viewport Grid Split: Left Brand Panel + Right Auth Panel */}
      <main style={{ display: "grid", height: "100vh", width: "100vw", gridTemplateColumns: "45fr 55fr" }}>
        
        {/* Left Column Display Brand Panel */}
        <BrandPanel />

        {/* Right Column Auth Console Panel */}
        <section 
          style={{ 
            position: "relative", 
            display: "grid", 
            placeContent: "center", 
            overflow: "hidden", 
            backgroundColor: "#0e1217", 
            padding: "1.5rem" 
          }}
        >
          {/* Blurred Background servers */}
          <img
            src="/servers.jpg"
            alt="Servers background"
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              height: "100%",
              width: "100%",
              objectFit: "cover",
              opacity: 0.4,
              filter: "blur(4px)",
              pointerEvents: "none",
            }}
          />
          
          {/* Dark Console Veil Overlay */}
          <div className="bg-console-veil" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }} aria-hidden="true" />

          {/* Centered Auth Card Container */}
          <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "420px", gap: "1.25rem" }}>
            
            <h2 
              className="text-scan font-sans" 
              style={{ 
                margin: 0, 
                fontSize: "clamp(1.1rem, 2.2vw, 1.8rem)", 
                fontWeight: 700, 
                textTransform: "uppercase", 
                letterSpacing: "0.08em", 
                textAlign: "center",
                color: "#34ebac",
                fontFamily: "var(--font-inter), sans-serif",
                textShadow: "0 0 12px rgba(52, 235, 172, 0.3)",
              }}
            >
              {isDbEmpty ? "Initial Setup — Request Invite" : "Scan face to login"}
            </h2>

            {/* If Database is empty, show Email Invite Request Card */}
            {isDbEmpty ? (
              <div 
                style={{ 
                  width: "100%", 
                  backgroundColor: "#111827", 
                  border: "1px solid rgba(52, 235, 172, 0.3)", 
                  borderRadius: "16px", 
                  padding: "1.5rem", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "1rem", 
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                  boxSizing: "border-box",
                }}
              >
                {!inviteSent ? (
                  <form onSubmit={handleSendBootstrapInvite} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.82rem", color: "#9ca3af", lineHeight: 1.4 }}>
                        System database is empty. Enter your details to generate a secure email invitation link for initial Super Admin registration.
                      </p>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "#e5e7eb", marginBottom: "0.3rem", fontWeight: 600 }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Raksha"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        className="neon-input"
                        style={{ width: "100%", marginBottom: "0.75rem" }}
                      />

                      <label style={{ display: "block", fontSize: "0.75rem", color: "#e5e7eb", marginBottom: "0.3rem", fontWeight: 600 }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. ashwin@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="neon-input"
                        style={{ width: "100%" }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sendingInvite}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "9999px",
                        backgroundColor: "#009669",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        cursor: sendingInvite ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        boxShadow: "0 0 20px rgba(0, 150, 105, 0.4)",
                      }}
                    >
                      <Mail style={{ width: 16, height: 16 }} />
                      <span>{sendingInvite ? "Sending Email Invite..." : "Send Invitation Email"}</span>
                    </button>
                  </form>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CheckCircle2 style={{ width: 28, height: 28, color: "#10b981" }} />
                    </div>

                    <div>
                      <h4 style={{ margin: 0, color: "#34ebac", fontSize: "1rem", fontWeight: 700 }}>Invitation Link Generated</h4>
                      <p style={{ margin: "0.4rem 0 0 0", color: "#9ca3af", fontSize: "0.8rem", lineHeight: 1.4 }}>
                        An invitation link has been sent to <strong>{inviteEmail}</strong>. Click the link in your email to open the face registration console.
                      </p>
                    </div>

                    {inviteLink && (
                      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <input
                            type="text"
                            readOnly
                            value={inviteLink}
                            style={{
                              flex: 1,
                              padding: "0.5rem 0.75rem",
                              borderRadius: "8px",
                              backgroundColor: "#1f2937",
                              border: "1px solid #374151",
                              color: "#e5e7eb",
                              fontSize: "0.75rem",
                              fontFamily: "var(--font-mono)",
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            style={{
                              padding: "0.5rem 0.85rem",
                              borderRadius: "8px",
                              backgroundColor: "#374151",
                              color: "#ffffff",
                              border: "none",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                            }}
                          >
                            <Copy style={{ width: 14, height: 14 }} />
                            <span>{copied ? "Copied" : "Copy"}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => window.location.href = inviteLink}
                          style={{
                            width: "100%",
                            padding: "0.7rem 1rem",
                            borderRadius: "8px",
                            backgroundColor: "#009669",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            boxShadow: "0 0 15px rgba(0, 150, 105, 0.4)",
                          }}
                        >
                          <span>Open Registration Link Now</span>
                          <ExternalLink style={{ width: 15, height: 15 }} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Standard Face Login View */
              <FaceAuthCapture
                key={`login-${baseUrl}`}
                client={client.current}
                mode="face-login"
                onSuccess={handleSuccess}
                onError={(err) => setErrorMsg(err.message)}
              />
            )}

            {errorMsg && (
              <p style={{ color: "#ef4444", fontSize: "0.78rem", textAlign: "center", margin: 0, fontWeight: 600 }}>
                {errorMsg}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

