"use client";

import React from "react";
import { Minus, Square, X } from "lucide-react";

export function TitleBar() {
  return (
    <header style={{ display: "flex", height: "40px", flexShrink: 0, alignItems: "center", justifyContent: "space-between", backgroundColor: "var(--titlebar)", padding: "0 1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
      <span style={{ fontSize: "12px", letterSpacing: "0.2em", color: "var(--titlebar-foreground)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
        PREDATOR
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", color: "var(--titlebar-foreground)" }}>
        <Minus style={{ width: "16px", height: "16px", cursor: "pointer", opacity: 0.7 }} />
        <Square style={{ width: "14px", height: "14px", cursor: "pointer", opacity: 0.7 }} />
        <X style={{ width: "16px", height: "16px", cursor: "pointer", opacity: 0.7 }} />
      </div>
    </header>
  );
}
