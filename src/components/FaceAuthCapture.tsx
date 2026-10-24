"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, AlertCircle, X } from "lucide-react";
import { FaceAuthClient } from "../api/face-auth-client";
import { captureVideoFrame } from "../lib/capture-frame";
import { setAuthSession } from "../lib/apiConfig";
import { useCamera } from "../hooks/useCamera";
import { ScanViewfinder } from "./auth/ScanViewfinder";

export type FaceAuthMode = "signup" | "face-login" | "accept-invite";

export interface FaceAuthCaptureProps {
  client: FaceAuthClient;
  mode: FaceAuthMode;
  /** Required for signup / accept-invite */
  email?: string;
  name?: string;
  /** Required for accept-invite */
  token?: string;
  className?: string;
  onSuccess?: (result: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
}

export function FaceAuthCapture({
  client,
  mode,
  email,
  name,
  token,
  className,
  onSuccess,
  onError,
}: FaceAuthCaptureProps) {
  const { videoRef, ready, error: cameraError } = useCamera({ enabled: true });
  const [status, setStatus] = useState("Position your face straight to login...");
  const [faceGuidance, setFaceGuidance] = useState("Position your face inside the box...");
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  const busyRef = useRef(false);
  const failedAttemptsRef = useRef<number>(0);
  const lastSignupAttemptTimeRef = useRef<number>(0);

  useEffect(() => {
    if (cameraError) setStatus(cameraError);
  }, [cameraError]);

  // Toast auto-hide effect after 4.5 seconds
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => {
        setToastMsg(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // MediaPipe Face Alignment Callback
  const handleFaceStateChange = useCallback(
    (state: { detected: boolean; aligned: boolean; guidance: string }) => {
      if (!success) {
        if ((mode === "signup" || mode === "accept-invite") && (!email?.trim() || !name?.trim())) {
          setFaceGuidance("Enter Full Name & Email above to enable auto-enrollment");
        } else {
          setFaceGuidance(state.guidance);
        }
        setIsFaceAligned(state.aligned);
      }
    },
    [success, mode, email, name]
  );

  // Manual submission handler as fallback
  const submit = useCallback(async () => {
    if (!videoRef.current || busyRef.current || success) return;
    if ((mode === "signup" || mode === "accept-invite") && (!email?.trim() || !name?.trim())) {
      const err = new Error("Full Name and Email Address are required for enrolment");
      setToastMsg(err.message);
      onError?.(err);
      return;
    }
    if (mode === "accept-invite" && !token) {
      const err = new Error("Invite token is required");
      setToastMsg(err.message);
      onError?.(err);
      return;
    }

    busyRef.current = true;
    setSubmitting(true);
    setStatus("Verifying biometrics with server...");
    try {
      const imageBase64 = captureVideoFrame(videoRef.current);
      let result;
      if (mode === "signup") {
        result = await client.signup({ email: email!.trim(), name: name!.trim(), imageBase64 });
      } else if (mode === "accept-invite") {
        result = await client.acceptInvite({
          token: token!,
          email: email!.trim(),
          name: name!.trim(),
          imageBase64,
        });
      } else {
        result = await client.faceLogin(imageBase64);
      }
      setSuccess(true);
      if (result.data && (result.data as any).access_token) {
        setAuthSession(String((result.data as any).access_token));
      }
      setStatus(result.message || "Success");
      onSuccess?.((result.data || {}) as Record<string, unknown>);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Face auth failed");
      if (mode === "face-login") {
        failedAttemptsRef.current += 1;
        if (failedAttemptsRef.current >= 2) {
          setToastMsg("⚠️ Security Alert: 2 Failed Face Scans — Snapshot Dispatched to Super Admin");
        } else {
          setToastMsg(error.message);
        }
      } else {
        setToastMsg(error.message);
      }
      setStatus(error.message);
      onError?.(error);
    } finally {
      setSubmitting(false);
      busyRef.current = false;
    }

  }, [client, mode, email, name, token, success, onSuccess, onError, videoRef]);

  // Continuous Automatic Background Scanning & Registration for All Modes
  useEffect(() => {
    if (!ready || success || !!cameraError) return;

    let intervalId: NodeJS.Timeout;

    const performAutoScan = async () => {
      // Only perform biometric matching/enrolment if MediaPipe confirms face is aligned
      if (!videoRef.current || busyRef.current || success || !isFaceAligned) return;

      // For signup / accept-invite, check required input fields
      if (mode === "signup" || mode === "accept-invite") {
        if (!email?.trim() || !name?.trim()) return;
        if (mode === "accept-invite" && !token) return;
        // Pause 3.5s after a failed attempt to prevent error spamming
        if (Date.now() - lastSignupAttemptTimeRef.current < 3500) return;
      }

      busyRef.current = true;
      setSubmitting(true);
      if (mode === "signup" || mode === "accept-invite") {
        lastSignupAttemptTimeRef.current = Date.now();
      }

      try {
        const imageBase64 = captureVideoFrame(videoRef.current);
        let result;

        if (mode === "signup") {
          setStatus("Enrolling biometrics automatically...");
          result = await client.signup({ email: email!.trim(), name: name!.trim(), imageBase64 });
        } else if (mode === "accept-invite") {
          setStatus("Enrolling biometrics automatically...");
          result = await client.acceptInvite({
            token: token!,
            email: email!.trim(),
            name: name!.trim(),
            imageBase64,
          });
        } else {
          result = await client.faceLogin(imageBase64);
        }

        if (result.success) {
          failedAttemptsRef.current = 0;
          setSuccess(true);
          if (result.data && (result.data as any).access_token) {
            setAuthSession(String((result.data as any).access_token));
          }
          setStatus(result.message || (mode === "face-login" ? "Biometrics Verified — Logging in..." : "Face Enrolled Successfully"));
          onSuccess?.((result.data || {}) as Record<string, unknown>);
        }
      } catch (err) {
        failedAttemptsRef.current += 1;
        const error = err instanceof Error ? err : new Error("Face auth failed");
        const errMsg = error.message;

        if (mode === "face-login") {
          if (failedAttemptsRef.current >= 5) {
            setToastMsg(errMsg);
            setStatus(errMsg);
            failedAttemptsRef.current = 0;
          }
        } else {
          setToastMsg(errMsg);
          setStatus(errMsg);
          onError?.(error);
        }
      } finally {
        setSubmitting(false);
        busyRef.current = false;
      }
    };

    // Continuous auto-scan loop every 1200ms when aligned
    intervalId = setInterval(() => {
      void performAutoScan();
    }, 1200);

    return () => {
      clearInterval(intervalId);
    };
  }, [mode, ready, success, cameraError, isFaceAligned, email, name, token, client, onSuccess, onError, videoRef]);

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1.5rem" }}>
      
      {/* Toast Error Message Notification Banner */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            backgroundColor: "#7f1d1d",
            color: "#fecaca",
            border: "1px solid #ef4444",
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            maxWidth: "420px",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          <AlertCircle style={{ width: "20px", height: "20px", color: "#f87171", flexShrink: 0 }} />
          <span style={{ flex: 1, lineHeight: 1.3 }}>{toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            style={{ background: "transparent", border: "none", color: "#fecaca", cursor: "pointer", padding: 0 }}
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      )}

      {/* HUD Camera Viewfinder Frame */}
      <ScanViewfinder
        videoRef={videoRef}
        ready={ready}
        cameraError={cameraError}
        submitting={submitting}
        success={success}
        onFaceStateChange={handleFaceStateChange}
      />

      {/* Live Status Guideline */}
      <p style={{ margin: 0, fontSize: "0.85rem", textAlign: "center", color: success ? "#34ebac" : cameraError ? "#ef4444" : "rgba(243, 244, 246, 0.8)", fontWeight: 500, fontFamily: "var(--font-inter), sans-serif" }}>
        {success ? status : cameraError ? cameraError : faceGuidance}
      </p>

      {/* Auto-Enrolment Status Indicator for Signup / Accept-Invite */}
      {mode !== "face-login" && (
        <div style={{ position: "relative", display: "flex", width: "100%", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              borderRadius: "9999px",
              border: success
                ? "1px solid #10b981"
                : submitting || (isFaceAligned && email?.trim() && name?.trim())
                ? "1px solid #34ebac"
                : "1px solid rgba(255, 255, 255, 0.15)",
              padding: "0.75rem 2rem",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: success ? "#34ebac" : submitting || (isFaceAligned && email?.trim() && name?.trim()) ? "#34ebac" : "#9ca3af",
              boxShadow: success
                ? "0 0 24px -6px #10b981"
                : submitting || (isFaceAligned && email?.trim() && name?.trim())
                ? "0 0 24px -6px #34ebac"
                : "none",
              backgroundColor: success ? "rgba(16, 185, 129, 0.15)" : "transparent",
              transition: "all 0.3s ease",
              fontWeight: 600,
              fontFamily: "var(--font-inter), sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            {submitting ? (
              <span>Enrolling Biometrics...</span>
            ) : success ? (
              <span>Access Granted</span>
            ) : !email?.trim() || !name?.trim() ? (
              <span>Enter Details Above to Auto-Enroll</span>
            ) : isFaceAligned ? (
              <span>Auto-Enrolling Face...</span>
            ) : (
              <span>Align Face inside frame to register</span>
            )}
          </div>

          <Sparkles
            style={{
              position: "absolute",
              right: "0px",
              top: "8px",
              width: "32px",
              height: "32px",
              color: "rgba(243, 244, 246, 0.4)",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );

}

export default FaceAuthCapture;
