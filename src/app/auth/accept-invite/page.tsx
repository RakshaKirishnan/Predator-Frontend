"use client";

import React, { useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { BrandPanel } from "../../../components/auth/BrandPanel";
import { FaceAuthCapture } from "../../../components/FaceAuthCapture";
import { FaceAuthClient } from "../../../api/face-auth-client";
import { getApiBaseUrl } from "../../../lib/apiConfig";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || email;

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const baseUrl = getApiBaseUrl();
  const client = useRef(new FaceAuthClient({ baseUrl }));




  const handleSuccess = () => {
    setShowSuccessModal(true);
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", width: "100%", backgroundColor: "#0b0f17", color: "#ffffff" }}>
      {/* Success Registration Popup Overlay */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(12px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "24px",
              padding: "2.5rem 2rem",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "1.25rem",
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                backgroundColor: "#ecfdf5",
                border: "2px solid #009669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(0, 150, 105, 0.2)",
              }}
            >
              <CheckCircle2 style={{ width: 38, height: 38, color: "#009669" }} />
            </div>

            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#009669", letterSpacing: "0.04em", fontFamily: "var(--font-archivo-black), sans-serif", textTransform: "uppercase" }}>
                Account Registered Successfully
              </h2>
              <p style={{ margin: "0.6rem 0 0 0", color: "#4b5563", fontSize: "0.88rem", lineHeight: 1.5, fontFamily: "var(--font-inter), sans-serif" }}>
                Your facial biometrics have been securely enrolled into the PREDATOR security database.
              </p>
            </div>

            <div
              style={{
                width: "100%",
                backgroundColor: "#f8fafc",
                borderRadius: "14px",
                padding: "1rem 1.2rem",
                textAlign: "left",
                fontSize: "0.85rem",
                color: "#1e293b",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#64748b", fontWeight: 500 }}>Name:</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontWeight: 500 }}>Email:</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{email}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/")}
              style={{
                marginTop: "0.5rem",
                width: "100%",
                padding: "0.85rem 1.5rem",
                borderRadius: "9999px",
                backgroundColor: "#009669",
                color: "#ffffff",
                border: "none",
                fontSize: "0.9rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 14px rgba(0, 150, 105, 0.35)",
                transition: "all 0.2s ease",
              }}
            >
              <span>PROCEED TO LOGIN</span>
              <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>
      )}

      {/* Split Landing View */}
      <main style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", height: "100vh" }}>
        <BrandPanel />

        <section style={{ backgroundColor: "#0e1217", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "0.18em", color: "#34ebac", margin: 0, fontFamily: "var(--font-archivo-black), sans-serif", textTransform: "uppercase" }}>
              REGISTER YOUR FACE
            </h1>

            <div style={{ textAlign: "center", fontSize: "0.85rem", color: "rgba(243, 244, 246, 0.8)" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{name}</p>
              <p style={{ margin: "0.2rem 0 0 0", color: "#9ca3af", fontSize: "0.78rem" }}>{email}</p>
            </div>

            <FaceAuthCapture
              client={client.current}
              mode="accept-invite"
              email={email}
              name={name}
              token={token}
              onSuccess={handleSuccess}
              onError={(err: Error) => setErrorMsg(err.message)}
            />

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

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "#fff" }}>Loading invitation...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
