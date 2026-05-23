import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

const TAU = Math.PI * 2;
const NODE_COUNT = 64;
const STREAM_COUNT = 36;
const RING_COUNT = 5;
const BEAM_COUNT = 18;
const GLYPH_COUNT = 48;
const HELIX_COUNT = 34;
const SHOCK_COUNT = 4;

const hexToRgb = (hex: string) => {
  const safe = hex.replace('#', '');
  const value = parseInt(safe, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const toRgba = (hex: string, alpha: number) => {
  const {r, g, b} = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const palette = {
  bgA: '#050b14',
  bgB: '#0b1826',
  bgC: '#12304a',
  cyan: '#57e7ff',
  mint: '#7dffc8',
  amber: '#ffe081',
  blue: '#4ea0ff',
};

export const TechLoopBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();

  const t = (frame % durationInFrames) / durationInFrames;
  const phase = t * TAU;
  const pulse = 0.5 + 0.5 * Math.sin(phase * 2);
  const drift = Math.sin(phase * 1.5) * 0.03;

  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background: `radial-gradient(circle at ${50 + Math.sin(phase) * 10}% ${42 + Math.cos(phase * 1.1) * 8}%, ${palette.bgC} 0%, ${palette.bgB} 46%, ${palette.bgA} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.45,
          backgroundImage:
            'linear-gradient(to right, rgba(87, 231, 255, 0.24) 1px, transparent 1px), linear-gradient(to bottom, rgba(87, 231, 255, 0.18) 1px, transparent 1px)',
          backgroundSize: '220px 140px',
          backgroundPosition: `${Math.sin(phase) * 110}px ${Math.cos(phase) * 70}px`,
          transform: `perspective(1500px) rotateX(62deg) scale(${1.2 + drift}) translateY(28%)`,
          transformOrigin: '50% 100%',
          filter: 'blur(0.4px)',
        }}
      />

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at center, rgba(0, 0, 0, 0) 36%, rgba(0, 0, 0, 0.55) 100%)',
        }}
      />

      {new Array(SHOCK_COUNT).fill(true).map((_, i) => {
        const local = (t * (1 + i * 0.25) + i * 0.2) % 1;
        const radius = 120 + local * Math.max(width, height) * 0.9;
        const alpha = (1 - local) * 0.28;
        return (
          <div
            key={`shock-${i}`}
            style={{
              position: 'absolute',
              left: centerX,
              top: centerY,
              width: radius * 2,
              height: radius * 2,
              borderRadius: 9999,
              border: `2px solid ${toRgba(i % 2 === 0 ? palette.cyan : palette.blue, alpha)}`,
              boxShadow: `0 0 50px ${toRgba(palette.cyan, alpha * 0.8)}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}

      {new Array(RING_COUNT).fill(true).map((_, i) => {
        const n = i + 1;
        const size = 520 + n * 320;
        const wobble = 1 + 0.04 * Math.sin(phase * (n + 1) + n);
        const rot = phase * (0.2 + n * 0.1) * (i % 2 === 0 ? 1 : -1);
        const alpha = 0.1 + (RING_COUNT - i) * 0.045;
        return (
          <div
            key={`ring-${i}`}
            style={{
              position: 'absolute',
              left: centerX,
              top: centerY,
              width: size,
              height: size,
              borderRadius: size,
              border: `1px solid ${toRgba(i % 2 === 0 ? palette.cyan : palette.mint, alpha)}`,
              boxShadow: `0 0 ${20 + n * 6}px ${toRgba(palette.cyan, alpha * 0.9)}`,
              transform: `translate(-50%, -50%) rotate(${rot}rad) scale(${wobble})`,
            }}
          />
        );
      })}

      {new Array(BEAM_COUNT).fill(true).map((_, i) => {
        const angle = (i / BEAM_COUNT) * TAU + phase * 0.12;
        const radial = 420 + (i % 6) * 190;
        const x = centerX + Math.cos(angle) * radial;
        const y = centerY + Math.sin(angle) * radial * 0.62;
        const length = 500 + (i % 5) * 260;
        const strength = 0.08 + 0.1 * Math.sin(phase * 2 + i) ** 2;
        const beamColor = i % 3 === 0 ? palette.cyan : i % 3 === 1 ? palette.blue : palette.mint;
        return (
          <div
            key={`beam-${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: length,
              height: 2,
              background: `linear-gradient(90deg, transparent 0%, ${toRgba(
                beamColor,
                strength
              )} 50%, transparent 100%)`,
              transform: `translate(-50%, -50%) rotate(${angle}rad)`,
              filter: 'blur(0.35px)',
            }}
          />
        );
      })}

      {new Array(HELIX_COUNT).fill(true).map((_, i) => {
        const k = i / HELIX_COUNT;
        const sweep = phase * 2.2 + k * TAU * 2.4;
        const x = centerX + Math.cos(sweep) * (260 + k * 1180);
        const y = centerY + Math.sin(sweep * 1.6) * 220;
        const yMirror = centerY - (y - centerY);
        const dot = 4 + (i % 3);
        const aura = 0.3 + 0.7 * Math.sin(phase * 3 + i) ** 2;
        return (
          <React.Fragment key={`helix-${i}`}>
            <div
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: dot,
                height: dot,
                borderRadius: dot,
                background: toRgba(palette.cyan, 0.95),
                boxShadow: `0 0 20px ${toRgba(palette.cyan, aura)}`,
                transform: 'translate(-50%, -50%)',
                opacity: 0.5 + aura * 0.5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: x,
                top: yMirror,
                width: dot,
                height: dot,
                borderRadius: dot,
                background: toRgba(palette.mint, 0.95),
                boxShadow: `0 0 20px ${toRgba(palette.mint, aura)}`,
                transform: 'translate(-50%, -50%)',
                opacity: 0.5 + aura * 0.5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: x,
                top: centerY,
                width: 1,
                height: Math.abs(y - yMirror),
                background: `linear-gradient(to bottom, ${toRgba(
                  palette.blue,
                  0.18
                )} 0%, transparent 100%)`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          </React.Fragment>
        );
      })}

      {new Array(STREAM_COUNT).fill(true).map((_, i) => {
        const lane = ((i * 97) % 1000) / 1000;
        const speed = (i % 4) + 1;
        const p = ((t * speed + lane) % 1 + 1) % 1;
        const x = p * width;
        const y =
          height * (0.12 + ((i * 53) % 1000) / 1000 * 0.76) +
          Math.sin(phase * (1 + (i % 5) * 0.25) + i) * 36;
        const w = 140 + (i % 7) * 45;
        const h = 2 + (i % 3);
        const color = i % 2 === 0 ? palette.cyan : palette.mint;
        const alpha = 0.25 + 0.45 * Math.sin(phase * (2 + (i % 3)) + i) ** 2;
        return (
          <div
            key={`stream-${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: w,
              height: h,
              borderRadius: 999,
              background: `linear-gradient(90deg, transparent 0%, ${toRgba(
                color,
                alpha
              )} 48%, transparent 100%)`,
              boxShadow: `0 0 18px ${toRgba(color, alpha)}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}

      {new Array(NODE_COUNT).fill(true).map((_, i) => {
        const orbit = (i + 1) / NODE_COUNT;
        const angle = phase * (0.4 + (i % 7) * 0.11) + orbit * TAU;
        const radiusX = width * (0.08 + ((i * 47) % 1000) / 1000 * 0.44);
        const radiusY = height * (0.08 + ((i * 31) % 1000) / 1000 * 0.34);
        const x = centerX + Math.cos(angle) * radiusX;
        const y = centerY + Math.sin(angle * 1.28) * radiusY;
        const size = 4 + (i % 6) * 2;
        const color = i % 4 === 0 ? palette.amber : i % 2 === 0 ? palette.cyan : palette.blue;
        const op = 0.25 + 0.75 * Math.sin(phase * (1.8 + (i % 5) * 0.4) + i) ** 2;
        return (
          <div
            key={`node-${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: size,
              backgroundColor: toRgba(color, 0.95),
              boxShadow: `0 0 ${12 + size * 3}px ${toRgba(color, op)}`,
              transform: 'translate(-50%, -50%)',
              opacity: op,
            }}
          />
        );
      })}

      {new Array(GLYPH_COUNT).fill(true).map((_, i) => {
        const p = i / GLYPH_COUNT;
        const ring = 700 + (i % 3) * 240;
        const spin = phase * (i % 2 === 0 ? 0.6 : -0.8) + p * TAU;
        const x = centerX + Math.cos(spin) * ring;
        const y = centerY + Math.sin(spin) * ring * 0.58;
        const w = 16 + (i % 4) * 8;
        const h = 4 + (i % 3) * 2;
        const op = 0.2 + 0.6 * Math.sin(phase * (2 + (i % 4)) + i * 0.4) ** 2;
        return (
          <div
            key={`glyph-${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: w,
              height: h,
              borderRadius: 999,
              background: toRgba(i % 2 === 0 ? palette.amber : palette.cyan, 0.95),
              boxShadow: `0 0 18px ${toRgba(palette.amber, op)}`,
              transform: `translate(-50%, -50%) rotate(${spin}rad)`,
              opacity: op,
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          background: `radial-gradient(circle at center, ${toRgba(
            palette.cyan,
            0.22 + pulse * 0.2
          )} 0%, rgba(255,255,255,0) 22%), radial-gradient(circle at center, ${toRgba(
            palette.amber,
            0.14 + pulse * 0.1
          )} 0%, rgba(255,255,255,0) 36%)`,
          transform: `scale(${1 + 0.08 * Math.sin(phase * 2)})`,
        }}
      />

      <AbsoluteFill
        style={{
          mixBlendMode: 'screen',
          opacity: 0.4 + pulse * 0.16,
          background:
            'linear-gradient(120deg, rgba(255, 224, 129, 0.04) 8%, rgba(255, 255, 255, 0) 32%, rgba(87, 231, 255, 0.1) 52%, rgba(255, 255, 255, 0) 72%, rgba(125, 255, 200, 0.08) 94%)',
          transform: `translateX(${Math.sin(phase) * 120}px)`,
        }}
      />

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 32%)',
          mixBlendMode: 'screen',
          opacity: 0.18 + pulse * 0.2,
        }}
      />
    </AbsoluteFill>
  );
};
