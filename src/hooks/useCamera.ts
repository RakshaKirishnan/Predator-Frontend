"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCameraOptions {
  facingMode?: "user" | "environment";
  enabled?: boolean;
}

export function useCamera(options: UseCameraOptions = {}) {
  const { facingMode = "user", enabled = true } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>("");

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setReady(false);
  }, []);

  const start = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
        await new Promise<void>((resolve) => {
          if (!videoRef.current) return resolve();
          if (videoRef.current.readyState >= 2) return resolve();
          videoRef.current.onloadedmetadata = () => resolve();
        });
      }
      setReady(true);
    } catch {
      setError("Camera access denied or unavailable");
      setReady(false);
    }
  }, [facingMode]);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    void start();
    return () => stop();
  }, [enabled, start, stop]);

  return { videoRef, ready, error, start, stop };
}
