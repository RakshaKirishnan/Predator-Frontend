"use client";

import React from "react";
import { BatteryMedium, CameraOff, Loader2 } from "lucide-react";
import { FaceMesh } from "./FaceMesh";
import { Corner } from "./Corner";
import { MediaPipeOverlay } from "./MediaPipeOverlay";

interface ScanViewfinderProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  ready: boolean;
  cameraError?: string | null;
  submitting: boolean;
  success: boolean;
  onRetryCamera?: () => void;
  onFaceStateChange?: (state: {
    detected: boolean;
    aligned: boolean;
    guidance: string;
  }) => void;
}

export function ScanViewfinder({
  videoRef,
  ready,
  cameraError,
  submitting,
  success,
  onRetryCamera,
  onFaceStateChange,
}: ScanViewfinderProps) {
  return (
    <div
      className="relative aspect-[5/7] w-full max-w-[340px] max-h-[58vh] overflow-hidden rounded-2xl bg-console shadow-console"
      style={{
        position: "relative",
        aspectRatio: "5/7",
        width: "100%",
        maxWidth: "340px",
        maxHeight: "58vh",
        overflow: "hidden",
        borderRadius: "1rem",
        backgroundColor: "var(--console)",
        boxShadow: "var(--shadow-console)",
      }}
    >
      {/* Live Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-label="Live camera feed for face authentication"
        style={{
          height: "100%",
          width: "100%",
          transform: "scaleX(-1)",
          objectFit: "cover",
          transition: "opacity 0.5s ease",
          opacity: ready ? 1 : 0,
        }}
      />

      {/* Real-time MediaPipe 468 Landmark Tracking Overlay */}
      {ready && !success && (
        <MediaPipeOverlay
          videoRef={videoRef}
          enabled={ready && !success}
          onFaceStateChange={onFaceStateChange}
        />
      )}

      {/* Face Mesh Landmark SVG Overlay Fallback */}
      {ready && !success && <FaceMesh />}

      {/* Laser Scanning Line Animation */}
      {ready && !success && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 15,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, var(--scan), transparent)",
              boxShadow: "0 0 15px 2px var(--scan)",
              animation: "scan-laser 2.5s ease-in-out infinite",
            }}
          />
        </div>
      )}

      {/* 4 Corner Anchors */}
      <Corner style={{ top: "12px", left: "12px", borderLeft: "2px solid", borderTop: "2px solid", borderTopLeftRadius: "8px" }} />
      <Corner style={{ top: "12px", right: "12px", borderRight: "2px solid", borderTop: "2px solid", borderTopRightRadius: "8px" }} />
      <Corner style={{ bottom: "12px", left: "12px", borderLeft: "2px solid", borderBottom: "2px solid", borderBottomLeftRadius: "8px" }} />
      <Corner style={{ bottom: "12px", right: "12px", borderRight: "2px solid", borderBottom: "2px solid", borderBottomRightRadius: "8px" }} />

      {/* Scanning Header & Footer Overlay Labels */}
      <span
        style={{
          position: "absolute",
          left: "50%",
          top: "20px",
          transform: "translateX(-50%)",
          fontSize: "11px",
          letterSpacing: "0.25em",
          color: "#87fcd3",
          fontFamily: "var(--font-jetbrains-mono), 'Courier New', monospace",
          fontWeight: 600,
          zIndex: 20,
        }}
      >
        {submitting ? "VERIFYING..." : "SCANNING"}
      </span>

      <span
        style={{
          position: "absolute",
          left: "50%",
          bottom: "24px",
          transform: "translateX(-50%)",
          fontSize: "11px",
          letterSpacing: "0.25em",
          color: "#87fcd3",
          fontFamily: "var(--font-jetbrains-mono), 'Courier New', monospace",
          fontWeight: 600,
          zIndex: 20,
        }}
      >
        SCANNING
      </span>

      <BatteryMedium
        style={{
          position: "absolute",
          right: "20px",
          top: "16px",
          width: "16px",
          height: "16px",
          color: "#34ebac",
          zIndex: 20,
        }}
      />

      {/* Camera Off / Loading State */}
      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeContent: "center",
            gap: "0.75rem",
            backgroundColor: "#0e1217",
            padding: "1.5rem",
            textAlign: "center",
            zIndex: 25,
          }}
        >
          {cameraError ? (
            <>
              <CameraOff style={{ margin: "0 auto", width: "28px", height: "28px", color: "#87fcd3" }} />
              <p style={{ maxWidth: "16rem", fontSize: "0.85rem", color: "rgba(243, 244, 246, 0.8)", margin: 0, fontFamily: "var(--font-inter), sans-serif" }}>
                Camera access denied &mdash; enable camera permissions to continue
              </p>
              {onRetryCamera && (
                <button
                  type="button"
                  onClick={onRetryCamera}
                  style={{
                    margin: "0 auto",
                    borderRadius: "9999px",
                    border: "1px solid rgba(52, 235, 172, 0.5)",
                    padding: "0.5rem 1.25rem",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "#f3f4f6",
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  Try Again
                </button>
              )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <Loader2 style={{ width: "24px", height: "24px", color: "#34ebac", animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: "0.85rem", letterSpacing: "0.05em", color: "#87fcd3", margin: 0, fontFamily: "var(--font-inter), sans-serif" }}>
                Requesting camera access…
              </p>
            </div>
          )}
        </div>
      )}

      {/* Verified Success State Overlay */}
      {success && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 150, 105, 0.25)",
            backdropFilter: "blur(12px)",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: "1.2rem",
            zIndex: 30,
            gap: "0.75rem",
            textShadow: "0 0 12px var(--scan)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "var(--scan)",
              color: "var(--console)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 25px var(--scan)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span style={{ letterSpacing: "0.2em" }}>VERIFIED</span>
        </div>
      )}

      <style jsx global>{`
        @keyframes scan-laser {
          0% { top: 0%; opacity: 0.3; }
          50% { top: 96%; opacity: 1; }
          100% { top: 0%; opacity: 0.3; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
