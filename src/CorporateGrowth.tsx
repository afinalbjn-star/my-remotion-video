import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, random } from "remotion";
import React, { useMemo } from "react";

export const CorporateGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Colors
  const bgMidnightBlue = "#0A0F1F";
  const cyberTeal = "#00E5FF";
  const pureWhite = "#FFFFFF";

  // --- Grid Animation (Fly-through effect) ---
  // We move the grid on the Y axis in 3D space to simulate moving forward.
  // We'll move it by 1000px over 600 frames.
  const gridOffset = interpolate(frame, [0, 600], [0, 2000]);

  // --- Particles Data ---
  const particles = useMemo(() => {
    return new Array(100).fill(0).map((_, i) => {
      return {
        id: i,
        x: random(`x-${i}`) * width,
        y: random(`y-${i}`) * height,
        z: random(`z-${i}`) * 15, // z controls size and blur for depth of field
        speed: random(`speed-${i}`) * 3 + 1,
      };
    });
  }, [width, height]);

  // --- SVG Path Animation ---
  const pathLength = 3500; // Approximate length of the SVG path
  const drawProgress = interpolate(frame, [0, 450], [pathLength, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // --- Typography Timings ---
  // ANALYZE: 0 - 200
  // OPTIMIZE: 200 - 400
  // SCALE: 400 - 600
  
  const getWordStyle = (startFrame: number, endFrame: number) => {
    const opacityIn = interpolate(frame, [startFrame, startFrame + 30], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
    const opacityOut = interpolate(frame, [endFrame - 30, endFrame], [1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
    const opacity = frame < (startFrame + endFrame) / 2 ? opacityIn : opacityOut;
    
    const translateY = interpolate(frame, [startFrame, endFrame], [50, -50], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
    const letterSpacing = interpolate(frame, [startFrame, endFrame], [10, 40], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

    return { opacity, translateY, letterSpacing };
  };

  const word1 = getWordStyle(0, 200);
  const word2 = getWordStyle(200, 400);
  const word3 = getWordStyle(400, 600);

  // Intense glow on SCALE
  const scaleGlow = interpolate(frame, [400, 600], [0, 50], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: bgMidnightBlue, overflow: "hidden" }}>
      
      {/* 3D Grid Floor */}
      <div
        style={{
          position: "absolute",
          width: "200%",
          height: "200%",
          left: "-50%",
          top: "30%",
          backgroundImage: `
            linear-gradient(to right, rgba(0, 229, 255, 0.15) 2px, transparent 2px),
            linear-gradient(to bottom, rgba(0, 229, 255, 0.15) 2px, transparent 2px)
          `,
          backgroundSize: "150px 150px",
          transform: `perspective(1000px) rotateX(70deg) translateY(${gridOffset}px)`,
          transformOrigin: "top center",
          opacity: 0.6,
        }}
      />

      {/* Floating Particles (Depth of Field) */}
      {particles.map((p) => {
        // Move particles upwards
        const currentY = (p.y - frame * p.speed) % height;
        const wrappedY = currentY < -50 ? currentY + height + 100 : currentY;

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.x,
              top: wrappedY,
              width: 3 + p.z / 2,
              height: 3 + p.z / 2,
              backgroundColor: pureWhite,
              borderRadius: "50%",
              opacity: 0.2 + (15 - p.z) / 30, // particles further away (higher Z blur) are less opaque
              filter: `blur(${p.z}px)`,
              boxShadow: `0 0 ${10 + p.z}px ${cyberTeal}`,
            }}
          />
        );
      })}

      {/* SVG Line Graph */}
      <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={bgMidnightBlue} />
              <stop offset="40%" stopColor={cyberTeal} />
              <stop offset="100%" stopColor={pureWhite} />
            </linearGradient>
            <filter id="glowGraph">
              <feGaussianBlur stdDeviation="12" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            // An organic upward trending path across 2560x1440
            d="M -100 1200 Q 300 1100, 600 1000 T 1100 850 T 1600 650 T 2100 400 T 2700 100"
            fill="none"
            stroke="url(#neonGradient)"
            strokeWidth="18"
            strokeDasharray={pathLength}
            strokeDashoffset={drawProgress}
            strokeLinecap="round"
            filter="url(#glowGraph)"
          />
        </svg>
      </AbsoluteFill>

      {/* Typography layer */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
          fontWeight: 900,
          color: pureWhite,
          fontSize: "180px",
          textTransform: "uppercase",
        }}
      >
        {frame >= 0 && frame < 200 && (
          <div
            style={{
              position: "absolute",
              opacity: word1.opacity,
              transform: `translateY(${word1.translateY}px)`,
              letterSpacing: `${word1.letterSpacing}px`,
              textShadow: `0 0 30px rgba(255,255,255,0.4)`,
            }}
          >
            Analyze
          </div>
        )}

        {frame >= 200 && frame < 400 && (
          <div
            style={{
              position: "absolute",
              opacity: word2.opacity,
              transform: `translateY(${word2.translateY}px)`,
              letterSpacing: `${word2.letterSpacing}px`,
              textShadow: `0 0 30px rgba(0, 229, 255, 0.6)`,
              color: cyberTeal, // highlight the middle word
            }}
          >
            Optimize
          </div>
        )}

        {frame >= 400 && frame <= 600 && (
          <div
            style={{
              position: "absolute",
              opacity: word3.opacity,
              transform: `translateY(${word3.translateY}px) scale(${1 + (frame - 400) / 1000})`,
              letterSpacing: `${word3.letterSpacing}px`,
              textShadow: `0 0 ${scaleGlow}px ${cyberTeal}, 0 0 ${scaleGlow * 2}px ${cyberTeal}`,
              color: pureWhite,
            }}
          >
            Scale
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
