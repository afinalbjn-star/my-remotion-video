import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

// ─── Math helpers ────────────────────────────────────────────────────────────
const TAU = Math.PI * 2;
const sin = Math.sin;
const cos = Math.cos;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ─── Isometric projection helper ─────────────────────────────────────────────
function isoProject(
  x: number,
  y: number,
  z: number,
  camY: number,
  scale: number,
  cx: number,
  cy: number
): { sx: number; sy: number; depth: number } {
  const angle = Math.PI / 6; // 30°
  const px = (x - z) * cos(angle);
  const py = camY + (x + z) * sin(angle) - y;
  return { sx: cx + px * scale, sy: cy + py * scale, depth: x + z };
}

// ─── Node definition ─────────────────────────────────────────────────────────
interface NodeDef {
  id: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  phaseX: number;
  phaseY: number;
  phaseZ: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  radius: number;
  color: "cyan" | "violet" | "white";
  glowIntensity: number;
}

function seededRand(seed: number): number {
  const x = sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function generateNodes(count: number): NodeDef[] {
  return Array.from({ length: count }, (_, i) => {
    const r = seededRand(i + 1);
    const r2 = seededRand(i + 100);
    const r3 = seededRand(i + 200);
    const r4 = seededRand(i + 300);
    const r5 = seededRand(i + 400);
    const r6 = seededRand(i + 500);
    const r7 = seededRand(i + 600);
    const r8 = seededRand(i + 700);
    const r9 = seededRand(i + 800);
    const colorSeed = seededRand(i + 900);
    const color: "cyan" | "violet" | "white" =
      colorSeed < 0.4 ? "cyan" : colorSeed < 0.75 ? "violet" : "white";
    return {
      id: i,
      baseX: r * 28 - 14,
      baseY: r2 * 10 - 5,
      baseZ: r3 * 28 - 14,
      phaseX: r4 * TAU,
      phaseY: r5 * TAU,
      phaseZ: r6 * TAU,
      speedX: 0.3 + r7 * 0.7,
      speedY: 0.4 + r8 * 0.6,
      speedZ: 0.3 + r9 * 0.5,
      radius: 4 + seededRand(i + 950) * 8,
      color,
      glowIntensity: 0.5 + seededRand(i + 1000) * 0.5,
    };
  });
}

const NODES = generateNodes(38);

function getNodePosition(node: NodeDef, t: number) {
  return {
    x: node.baseX + sin(t * node.speedX + node.phaseX) * 2.5,
    y: node.baseY + sin(t * node.speedY + node.phaseY) * 1.8,
    z: node.baseZ + cos(t * node.speedZ + node.phaseZ) * 2.5,
  };
}

// ─── Grid lines ──────────────────────────────────────────────────────────────
interface GridLine {
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
}

function buildGrid(cols: number, rows: number, depth: number): GridLine[] {
  const lines: GridLine[] = [];
  const spacingX = 3.5;
  const spacingZ = 3.5;
  const levels = 3;
  const spacingY = 2.5;

  for (let level = 0; level < levels; level++) {
    const y = level * spacingY;
    for (let c = 0; c <= cols; c++) {
      const x = (c - cols / 2) * spacingX;
      lines.push({
        ax: x,
        ay: y,
        az: -(depth / 2) * spacingZ,
        bx: x,
        by: y,
        bz: (depth / 2) * spacingZ,
      });
    }
    for (let r = 0; r <= rows; r++) {
      const z = (r - rows / 2) * spacingZ;
      lines.push({
        ax: -(cols / 2) * spacingX,
        ay: y,
        az: z,
        bx: (cols / 2) * spacingX,
        by: y,
        bz: z,
      });
    }
  }
  return lines;
}

const GRID_LINES = buildGrid(12, 20, 20);

// ─── Color maps ──────────────────────────────────────────────────────────────
const COLOR_MAP = {
  cyan: { main: "#22d3ee", glow: "rgba(34,211,238," },
  violet: { main: "#8b5cf6", glow: "rgba(139,92,246," },
  white: { main: "#e0f2fe", glow: "rgba(224,242,254," },
};

// ─── Main component ───────────────────────────────────────────────────────────
export const ArchitecturalDigitalFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames, fps } = useVideoConfig();

  // Normalized looping time [0, TAU)
  const t = (frame / durationInFrames) * TAU;
  const tLinear = frame / fps; // seconds, used for smooth scroll

  // ── Camera / perspective params ──────────────────────────────────────────
  const SCALE = 62;
  const CX = width / 2;
  const CY = height * 0.46;

  // Forward fly-through: z-offset loops every cycle
  // We want the grid to move "toward" the viewer endlessly
  const gridZShift = ((tLinear * 1.8) % 3.5); // advances by one cell-width per loop segment

  // Gentle camera sway
  const camSwayX = sin(t * 0.8) * 0.04 * width;
  const camSwayY = cos(t * 0.6) * 0.02 * height;
  const camY = -3.2 + sin(t * 0.5) * 0.4; // vertical camera tilt oscillation

  // ── Pulse rhythm ─────────────────────────────────────────────────────────
  const pulse = (sin(t * 2.5) * 0.5 + 0.5); // 0..1 pulse
  const cyanOpacity = 0.18 + pulse * 0.12;
  const violetOpacity = 0.12 + (1 - pulse) * 0.12;

  // ── Project grid lines ───────────────────────────────────────────────────
  interface ProjectedLine {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    depth: number;
    opacity: number;
  }

  const projectedGrid: ProjectedLine[] = GRID_LINES.map((l) => {
    // Shift z for fly-through illusion (modulo so it loops)
    const az = l.az - gridZShift;
    const bz = l.bz - gridZShift;
    const a = isoProject(l.ax, l.ay, az, camY, SCALE, CX + camSwayX, CY + camSwayY);
    const b = isoProject(l.bx, l.by, bz, camY, SCALE, CX + camSwayX, CY + camSwayY);
    const avgDepth = (a.depth + b.depth) / 2;
    // Fade lines based on depth — far lines more transparent
    const normalDepth = interpolate(avgDepth, [-40, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const opacity = lerp(0.04, 0.28, 1 - Math.abs(normalDepth - 0.5) * 1.4);
    return { x1: a.sx, y1: a.sy, x2: b.sx, y2: b.sy, depth: avgDepth, opacity };
  }).sort((a, b) => a.depth - b.depth);

  // ── Project nodes ────────────────────────────────────────────────────────
  const projectedNodes = NODES.map((node) => {
    const pos = getNodePosition(node, tLinear);
    const proj = isoProject(pos.x, pos.y, pos.z, camY, SCALE, CX + camSwayX, CY + camSwayY);
    const normalDepth = interpolate(proj.depth, [-40, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Simulate depth of field: nodes far from center depth get blurry + transparent
    const depthBlur = Math.abs(normalDepth - 0.5) * 2; // 0 = center = sharp
    const opacity = interpolate(depthBlur, [0, 0.8, 1], [0.95, 0.5, 0.1], { extrapolateRight: "clamp" });
    const blurPx = depthBlur * 4;
    const scale = interpolate(normalDepth, [0, 1], [1.35, 0.65], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Individual pulse offset
    const nodePulse = sin(tLinear * node.glowIntensity * 3 + node.phaseX) * 0.5 + 0.5;
    return { ...node, ...proj, opacity, blurPx, scale, nodePulse, depth: proj.depth };
  }).sort((a, b) => a.depth - b.depth);

  // ── Build connections: closest pairs within threshold ────────────────────
  interface Connection {
    ax: number; ay: number; bx: number; by: number;
    color: "cyan" | "violet" | "white";
    opacity: number;
  }
  const MAX_CONN_DIST_SQ = 210 * 210;
  const connections: Connection[] = [];
  for (let i = 0; i < projectedNodes.length; i++) {
    for (let j = i + 1; j < projectedNodes.length; j++) {
      const na = projectedNodes[i];
      const nb = projectedNodes[j];
      const dx = na.sx - nb.sx;
      const dy = na.sy - nb.sy;
      const distSq = dx * dx + dy * dy;
      if (distSq < MAX_CONN_DIST_SQ) {
        const dist = Math.sqrt(distSq);
        const baseOp = interpolate(dist, [0, Math.sqrt(MAX_CONN_DIST_SQ)], [0.55, 0.0]);
        // Animate connection appearing/disappearing via sine wave keyed per pair
        const connAnim = sin(tLinear * 0.8 + (na.id + nb.id) * 0.37 + Math.PI) * 0.5 + 0.5;
        const opacity = baseOp * connAnim * Math.min(na.opacity, nb.opacity);
        if (opacity > 0.02) {
          connections.push({
            ax: na.sx, ay: na.sy, bx: nb.sx, by: nb.sy,
            color: na.color,
            opacity,
          });
        }
      }
    }
  }

  // ── Bokeh particles (background depth dots) ──────────────────────────────
  const bokehDots = Array.from({ length: 55 }, (_, i) => {
    const r1 = seededRand(i * 7 + 3000);
    const r2 = seededRand(i * 7 + 3001);
    const r3 = seededRand(i * 7 + 3002);
    const r4 = seededRand(i * 7 + 3003);
    const r5 = seededRand(i * 7 + 3004);
    const bx = r1 * width;
    const by = r2 * height;
    const radius = 2 + r3 * 28;
    const col = r4 < 0.5 ? COLOR_MAP.cyan : COLOR_MAP.violet;
    const phase = r5 * TAU;
    const opacity = (sin(tLinear * (0.3 + r3 * 0.4) + phase) * 0.5 + 0.5) * 0.18;
    return { bx, by, radius, col, opacity };
  });

  // ── Floating scan line effect ─────────────────────────────────────────────
  const scanY = ((tLinear * 0.12) % 1) * height;

  return (
    <div
      style={{
        width,
        height,
        background: "#020617",
        position: "relative",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {/* ── SVG Defs (filters) ─────────────────────────────────────── */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          {/* Bloom glow filter for nodes */}
          <filter id="bloomCyan" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="bloomViolet" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="gridGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softBloom" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="28" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* ── Layer 0: Background radial gradients (pulsing depth) ───── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 72% 55% at 28% 62%, rgba(34,211,238,${cyanOpacity}) 0%, transparent 70%),
            radial-gradient(ellipse 65% 50% at 74% 38%, rgba(139,92,246,${violetOpacity}) 0%, transparent 70%),
            radial-gradient(ellipse 45% 40% at 50% 85%, rgba(34,211,238,${cyanOpacity * 0.5}) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 15% 20%, rgba(139,92,246,${violetOpacity * 0.6}) 0%, transparent 65%)
          `,
        }}
      />

      {/* ── Layer 1: Bokeh depth-of-field circles ─────────────────── */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {bokehDots.map((d, i) => (
          <circle
            key={`bokeh-${i}`}
            cx={d.bx}
            cy={d.by}
            r={d.radius}
            fill={d.col.main}
            opacity={d.opacity}
            filter="url(#softBloom)"
          />
        ))}
      </svg>

      {/* ── Layer 2: Isometric wireframe grid ─────────────────────── */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${width} ${height}`}
        filter="url(#gridGlow)"
      >
        {projectedGrid.map((l, i) => (
          <line
            key={`grid-${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#22d3ee"
            strokeWidth={0.8}
            opacity={l.opacity}
          />
        ))}
      </svg>

      {/* ── Layer 3: Node connections ──────────────────────────────── */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {connections.map((c, i) => {
          const col = COLOR_MAP[c.color];
          return (
            <line
              key={`conn-${i}`}
              x1={c.ax}
              y1={c.ay}
              x2={c.bx}
              y2={c.by}
              stroke={col.main}
              strokeWidth={1.2}
              opacity={c.opacity}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* ── Layer 4: Floating geometry nodes with bloom ───────────── */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {projectedNodes.map((node) => {
          const col = COLOR_MAP[node.color];
          const r = node.radius * node.scale;
          const glowR = r + 6 + node.nodePulse * 8;
          const filterId = node.color === "cyan" ? "bloomCyan" : node.color === "violet" ? "bloomViolet" : "bloomCyan";
          const filterBlur = node.blurPx > 0 ? `blur(${node.blurPx}px)` : undefined;
          return (
            <g
              key={`node-${node.id}`}
              opacity={node.opacity}
              style={{ filter: filterBlur }}
            >
              {/* Outer glow ring */}
              <circle
                cx={node.sx}
                cy={node.sy}
                r={glowR}
                fill="none"
                stroke={col.main}
                strokeWidth={1}
                opacity={0.25 + node.nodePulse * 0.2}
                filter={`url(#${filterId})`}
              />
              {/* Secondary glow fill */}
              <circle
                cx={node.sx}
                cy={node.sy}
                r={r + 2}
                fill={`${col.glow}${(0.08 + node.nodePulse * 0.12).toFixed(2)})`}
                filter={`url(#${filterId})`}
              />
              {/* Core node */}
              <circle
                cx={node.sx}
                cy={node.sy}
                r={r}
                fill={`${col.glow}0.18)`}
                stroke={col.main}
                strokeWidth={1.5}
              />
              {/* Inner bright dot */}
              <circle
                cx={node.sx}
                cy={node.sy}
                r={r * 0.3}
                fill={col.main}
                opacity={0.85 + node.nodePulse * 0.15}
              />
            </g>
          );
        })}
      </svg>

      {/* ── Layer 5: Subtle horizontal scan line ──────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scanY,
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.08) 20%, rgba(34,211,238,0.18) 50%, rgba(34,211,238,0.08) 80%, transparent)",
          pointerEvents: "none",
        }}
      />

      {/* ── Layer 6: Vignette overlay ─────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 45%, rgba(2,6,23,0.55) 80%, rgba(2,6,23,0.88) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Layer 7: Top & bottom cinematic bars (subtle) ─────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(2,6,23,0.4) 0%, transparent 12%, transparent 88%, rgba(2,6,23,0.4) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Layer 8: Fine grain noise texture overlay ─────────────── */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, opacity: 0.018, mixBlendMode: "screen" }}
        viewBox={`0 0 ${width} ${height}`}
      >
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={width} height={height} filter="url(#noise)" />
      </svg>
    </div>
  );
};
