import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

// Utility untuk posisi X berbasis waktu yang seamless
const getLoopedX = (
  frame: number,
  fps: number,
  durationInSeconds: number,
  baseSpeed: number
) => {
  const totalFrames = fps * durationInSeconds;
  const raw = (frame * baseSpeed) % totalFrames; // 0..totalFrames
  const progress = raw / totalFrames; // 0..1
  // -100%..0% untuk pergeseran smooth dari kanan ke kiri
  return interpolate(progress, [0, 1], [0, -100]);
};

const WaveLayer: React.FC<{
  colorFrom: string;
  colorTo: string;
  blur: number;
  opacity: number;
  speed: number;
  offsetY: string;
  heightPercent: number;
}> = ({ colorFrom, colorTo, blur, opacity, speed, offsetY, heightPercent }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const durationInSeconds = durationInFrames / fps;

  const x = getLoopedX(frame, fps, durationInSeconds, speed);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: offsetY,
        width: "200%", // lebih lebar dari viewport supaya tidak kelihatan putus
        height: `${heightPercent}%`,
        opacity,
        filter: `blur(${blur}px)`,
        background: `radial-gradient(circle at 20% 0%, ${colorFrom}, transparent 60%),
                     radial-gradient(circle at 80% 100%, ${colorTo}, transparent 60%)`,
        transform: 'skewX(-12deg)',
        borderRadius: Math.min(width, height) * 0.2,
      }}
    />
  );
};

export const GradientTechWaves: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 0% 0%, #1e90ff 0%, #0b0220 55%, #020010 100%)",
        overflow: "hidden",
      }}
    >
      {/* Glow layer lembut di belakang */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 10% 10%, rgba(0, 255, 255, 0.25), transparent 60%)," +
            "radial-gradient(circle at 90% 80%, rgba(138, 43, 226, 0.3), transparent 65%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Wave belakang (paling lambat) */}
      <WaveLayer
        colorFrom="#4f46e5"
        colorTo="#0ea5e9"
        blur={80}
        opacity={0.4}
        speed={0.4}
        offsetY="55%"
        heightPercent={70}
      />

      {/* Wave tengah */}
      <WaveLayer
        colorFrom="#6366f1"
        colorTo="#22d3ee"
        blur={60}
        opacity={0.55}
        speed={0.7}
        offsetY="50%"
        heightPercent={60}
      />

      {/* Wave depan (paling cepat) */}
      <WaveLayer
        colorFrom="#a855f7"
        colorTo="#06b6d4"
        blur={40}
        opacity={0.7}
        speed={1}
        offsetY="45%"
        heightPercent={55}
      />

      {/* Sedikit grain/texture halus */}
      <AbsoluteFill
        style={{
          mixBlendMode: "soft-light",
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};