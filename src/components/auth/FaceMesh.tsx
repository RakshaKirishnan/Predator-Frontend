"use client";

import React from "react";

const POINTS: [number, number][] = [
  [50, 12], [38, 14], [62, 14], [28, 20], [72, 20],
  [22, 30], [78, 30], [20, 42], [80, 42], [22, 54],
  [78, 54], [27, 64], [73, 64], [34, 73], [66, 73],
  [42, 79], [58, 79], [50, 82],
  [36, 33], [44, 32], [56, 32], [64, 33],
  [38, 39], [43, 41], [57, 41], [62, 39],
  [50, 38], [50, 46], [50, 53], [44, 56], [56, 56],
  [46, 62], [54, 62], [50, 63], [50, 68], [42, 66], [58, 66],
  [33, 47], [67, 47], [32, 57], [68, 57], [50, 24],
];

function edges() {
  const list: [number, number, number, number][] = [];
  POINTS.forEach((p, i) => {
    const near = POINTS.map((q, j) => ({ j, d: Math.hypot(p[0] - q[0], p[1] - q[1]) }))
      .filter((e) => e.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 4);
    near.forEach((n) => {
      const q = POINTS[n.j]!;
      if (i < n.j) list.push([p[0], p[1], q[0], q[1]]);
    });
  });
  return list;
}

const EDGES = edges();

export function FaceMesh() {
  return (
    <svg
      style={{ position: "absolute", inset: 0, height: "100%", width: "100%", pointerEvents: "none", zIndex: 10 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g className="mesh-glow mesh-pulse" transform="translate(9.7 -0.2) scale(0.817 0.685)">
        {EDGES.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--scan)"
            strokeWidth="0.18"
            opacity="0.75"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {POINTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.5" fill="var(--scan)" />
        ))}
      </g>
    </svg>
  );
}
