"use client";

import React from "react";

export function Corner({ style }: { style: React.CSSProperties }) {
  return <span style={{ position: "absolute", width: "2rem", height: "2rem", borderColor: "rgba(255, 255, 255, 0.6)", zIndex: 12, pointerEvents: "none", ...style }} aria-hidden="true" />;
}
