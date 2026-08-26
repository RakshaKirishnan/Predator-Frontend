"use client";

import React from "react";

export function BrandPanel() {
  return (
    <section 
      style={{ 
        display: "grid", 
        placeContent: "center", 
        backgroundColor: "#ffffff", 
        padding: "2.5rem",
        borderRight: "1px solid rgba(0, 0, 0, 0.08)" 
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 
          style={{ 
            margin: 0, 
            fontSize: "clamp(3.5rem, 7.5vw, 6.8rem)", 
            lineHeight: 1, 
            letterSpacing: "0.03em", 
            fontFamily: "var(--font-archivo-black), Impact, 'Arial Black', sans-serif",
            fontWeight: 900,
            color: "#009669",
            textTransform: "uppercase",
          }}
        >
          PREDATOR
        </h1>
        <p 
          style={{ 
            marginTop: "1.25rem", 
            fontSize: "clamp(1.1rem, 2vw, 1.9rem)", 
            fontWeight: 400, 
            letterSpacing: "-0.01em", 
            color: "#059669",
            fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" 
          }}
        >
          See. Identify. Secure.
        </p>
      </div>
    </section>
  );
}
