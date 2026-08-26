"use client";

import React, { useEffect, useRef, useState } from "react";

interface MediaPipeOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled: boolean;
  onFaceStateChange?: (state: {
    detected: boolean;
    aligned: boolean;
    guidance: string;
  }) => void;
}

export function MediaPipeOverlay({
  videoRef,
  enabled,
  onFaceStateChange,
}: MediaPipeOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let faceMesh: any = null;
    let isActive = true;

    const loadMediaPipe = async () => {
      try {
        if (!(window as any).FaceMesh) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
            script.crossOrigin = "anonymous";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load MediaPipe script"));
            document.head.appendChild(script);
          });
        }

        if (!(window as any).FaceMesh) return;

        faceMesh = new (window as any).FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results: any) => {
          if (!isActive || !canvasRef.current) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (
            results.multiFaceLandmarks &&
            results.multiFaceLandmarks.length > 0
          ) {
            const landmarks = results.multiFaceLandmarks[0];

            // Calculate Key Facial Metrics & Validations
            const noseTip = landmarks[1];
            const leftEye = landmarks[33];
            const rightEye = landmarks[263];
            const jawBottom = landmarks[152];
            const forehead = landmarks[10];

            const centerX = noseTip.x;
            const centerY = (forehead.y + jawBottom.y) / 2;

            const eyeDist = Math.hypot(leftEye.x - rightEye.x, leftEye.y - rightEye.y);
            const noseLeftDist = Math.hypot(noseTip.x - leftEye.x, noseTip.y - leftEye.y);
            const noseRightDist = Math.hypot(rightEye.x - noseTip.x, rightEye.y - noseTip.y);
            const symmetryRatio = noseLeftDist / (noseRightDist || 0.001);
            const eyeTilt = Math.abs(leftEye.y - rightEye.y);

            // Eye Aspect Ratio (EAR) for Eyes-Open Verification (Multi-point 6-landmark calculation)
            const calcDist = (p1: any, p2: any) => p1 && p2 ? Math.hypot(p1.x - p2.x, p1.y - p2.y) : 0;

            const lTop1 = landmarks[159], lBot1 = landmarks[145];
            const lTop2 = landmarks[158], lBot2 = landmarks[144];
            const lCorner1 = landmarks[33], lCorner2 = landmarks[133];

            const leftHeight = (calcDist(lTop1, lBot1) + calcDist(lTop2, lBot2)) / 2;
            const leftWidth = calcDist(lCorner1, lCorner2);
            const leftEAR = leftWidth > 0 ? leftHeight / leftWidth : 0.25;

            const rTop1 = landmarks[386], rBot1 = landmarks[374];
            const rTop2 = landmarks[385], rBot2 = landmarks[373];
            const rCorner1 = landmarks[362], rCorner2 = landmarks[263];

            const rightHeight = (calcDist(rTop1, rBot1) + calcDist(rTop2, rBot2)) / 2;
            const rightWidth = calcDist(rCorner1, rCorner2);
            const rightEAR = rightWidth > 0 ? rightHeight / rightWidth : 0.25;

            const avgEAR = (leftEAR + rightEAR) / 2;
            const areEyesClosed = avgEAR < 0.21 || leftEAR < 0.18 || rightEAR < 0.18;

            let guidance = "Face Aligned — Scanning biometrics...";
            let aligned = true;

            // Strict Validation Flow
            if (centerX < 0.30 || centerX > 0.70 || centerY < 0.20 || centerY > 0.80) {
              guidance = "Fit your face inside the box";
              aligned = false;
            } else if (areEyesClosed) {
              guidance = "Open your eyes to verify biometrics...";
              aligned = false;
            } else if (eyeDist < 0.16) {
              guidance = "Move closer to camera";
              aligned = false;
            } else if (eyeDist > 0.52) {
              guidance = "Move slightly further back";
              aligned = false;
            } else if (symmetryRatio < 0.65 || symmetryRatio > 1.55) {
              guidance = "Look straight at the camera";
              aligned = false;
            } else if (eyeTilt > 0.08) {
              guidance = "Keep your head level & straight";
              aligned = false;
            }



            // Draw glowing landmark mesh overlay (color shifts based on validation)
            const nodeColor = aligned ? "#34ebac" : "#f59e0b";
            ctx.fillStyle = nodeColor;
            ctx.shadowColor = nodeColor;
            ctx.shadowBlur = aligned ? 4 : 2;

            landmarks.forEach((pt: { x: number; y: number }, idx: number) => {
              if (idx % 3 === 0) {
                const x = (1 - pt.x) * canvas.width;
                const y = pt.y * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, 1.2, 0, 2 * Math.PI);
                ctx.fill();
              }
            });

            onFaceStateChange?.({ detected: true, aligned, guidance });
          } else {
            onFaceStateChange?.({
              detected: false,
              aligned: false,
              guidance: "Position your face inside the box...",
            });
          }
        });

        setLoaded(true);

        // Frame processing loop
        let animFrameId: number;
        const processFrame = async () => {
          if (!isActive) return;
          if (
            videoRef.current &&
            videoRef.current.readyState >= 2 &&
            !videoRef.current.paused
          ) {
            try {
              await faceMesh.send({ image: videoRef.current });
            } catch {
              // Ignore transient frame errors
            }
          }
          animFrameId = requestAnimationFrame(processFrame);
        };
        animFrameId = requestAnimationFrame(processFrame);

        return () => {
          cancelAnimationFrame(animFrameId);
        };
      } catch (err) {
        console.warn("MediaPipe load fallback:", err);
      }
    };

    void loadMediaPipe();

    return () => {
      isActive = false;
      if (faceMesh) {
        try {
          faceMesh.close();
        } catch {
          // Ignore close error
        }
      }
    };
  }, [enabled, videoRef, onFaceStateChange]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={640}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 12,
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    />
  );
}
