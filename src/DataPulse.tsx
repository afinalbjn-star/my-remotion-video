import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import React from "react";

export const DataPulse: React.FC = () => {
  const frame = useCurrentFrame();

  // Accent Color
  const accentColor = "#00F0FF"; // Electric Blue

  // --- Background Animation ---
  // Slow pulsating effect for the radial gradient
  const bgPulse = interpolate(Math.sin(frame / 60), [-1, 1], [30, 50]);

  // --- Global End Transition (540 - 600) ---
  const globalScale = interpolate(frame, [540, 600], [1, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const globalOpacity = interpolate(frame, [540, 600], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Section 1: "STRATEGY" (0 - 180) ---
  const strategyOpacityIn = interpolate(frame, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const strategyOpacityOut = interpolate(frame, [150, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const strategyOpacity = frame < 150 ? strategyOpacityIn : strategyOpacityOut;
  const strategyLetterSpacing = interpolate(frame, [0, 180], [20, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Section 2: Progress (180 - 420) ---
  const progressOpacityIn = interpolate(frame, [180, 210], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const progressOpacityOut = interpolate(frame, [390, 420], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const progressOpacity = frame < 390 ? progressOpacityIn : progressOpacityOut;

  // Animate from 0 to 85%
  const percentageValue = interpolate(frame, [210, 360], [0, 85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Progress Bar width max 1200px
  const maxProgressBarWidth = 1200;
  const progressBarWidth = interpolate(percentageValue, [0, 100], [0, maxProgressBarWidth]);

  // --- Section 3: "SCALING SUCCESS" (420 - 600) ---
  const scalingOpacityIn = interpolate(frame, [420, 480], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scalingOpacity = scalingOpacityIn;
  // Glowing pulse effect for the final text
  const glowIntensity = interpolate(Math.sin(frame / 15), [-1, 1], [10, 40]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, #1a1a24 ${bgPulse}%, #05050a 100%)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${globalScale})`,
          opacity: globalOpacity,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Section 1: STRATEGY */}
        {frame < 180 && (
          <div
            style={{
              position: "absolute",
              opacity: strategyOpacity,
              fontSize: "180px",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: `${strategyLetterSpacing}px`,
              textTransform: "uppercase",
            }}
          >
            Strategy
          </div>
        )}

        {/* Section 2: Progress & Percentage */}
        {frame >= 180 && frame < 420 && (
          <div
            style={{
              position: "absolute",
              opacity: progressOpacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "360px",
                fontWeight: 900,
                color: accentColor,
                textShadow: `0 0 40px ${accentColor}`,
                lineHeight: 1,
                marginBottom: "40px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.floor(percentageValue)}%
            </div>
            
            {/* Progress Bar Container */}
            <div
              style={{
                width: `${maxProgressBarWidth}px`,
                height: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Progress Bar Fill */}
              <div
                style={{
                  width: `${progressBarWidth}px`,
                  height: "100%",
                  backgroundColor: accentColor,
                  boxShadow: `0 0 20px ${accentColor}`,
                  borderRadius: "10px",
                }}
              />
            </div>
          </div>
        )}

        {/* Section 3: SCALING SUCCESS */}
        {frame >= 420 && (
          <div
            style={{
              position: "absolute",
              opacity: scalingOpacity,
              fontSize: "200px",
              fontWeight: 900,
              color: accentColor,
              textTransform: "uppercase",
              textShadow: `0 0 ${glowIntensity}px ${accentColor}`,
              letterSpacing: "10px",
              textAlign: "center",
            }}
          >
            Scaling<br />Success
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
