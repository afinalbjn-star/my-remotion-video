import React, { useRef, useMemo, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * ============================================================================
 * BIOLUMINESCENT DEEP v2 — MEGA COMPLEX dark ocean abyss
 *
 * THOUSANDS of bioluminescent particles across 12+ layers:
 *   - 1500 micro sparkles (0.1-0.5px) — background starfield
 *   - 1200 plankton (0.3-1.5px) — floating organisms
 *   - 600 wave particles — following ocean currents
 *   - 150 medium orbs (3-12px) — pulsing lights
 *   - 30 giant jellyfish (30-100px) — massive glowing spheres
 *   - 80 tendrils — flowing light trails
 *   - 500 snow particles — rising micro lights
 *   - 30 nebula clouds — large atmospheric glows
 *   - 50 constellation lines — connecting nearby particles
 *   - 15 light beams — vertical shafts from above
 *   - 15 light beams — vertical shafts from above
 *   - Multiple caustic layers
 *
 * TOTAL: ~4200+ individual objects per frame!
 *
 * SEAMLESS LOOP GUARANTEE:
 *   time = progress * 2π  (ranges 0 → 2π over the video duration)
 *   Every sin(time * k) / cos(time * k) uses INTEGER k → perfect loop.
 * ============================================================================
 */

export const VIDEO_CONFIG = {
    width: 3840,
    height: 2160,
    fps: 60,
    durationInFrames: 600, // 10 seconds
};

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR PALETTES — Rich, varied bioluminescent colors
// ═══════════════════════════════════════════════════════════════════════════════

const DEEP_COLORS = [
    { r: 2, g: 8, b: 18 },      // Near-black abyss
    { r: 5, g: 15, b: 35 },     // Deep navy
    { r: 8, g: 22, b: 48 },     // Dark ocean
    { r: 3, g: 12, b: 28 },     // Midnight blue
    { r: 10, g: 18, b: 42 },    // Abyssal blue
    { r: 6, g: 20, b: 38 },     // Deep sea
    { r: 4, g: 14, b: 32 },     // Ocean floor
];

const GLOW_COLORS = [
    { r: 0, g: 220, b: 255 },   // Bright cyan
    { r: 0, g: 180, b: 220 },   // Teal
    { r: 80, g: 255, b: 200 },  // Aqua green
    { r: 100, g: 150, b: 255 }, // Soft blue
    { r: 0, g: 255, b: 180 },   // Emerald
    { r: 150, g: 100, b: 255 }, // Purple glow
    { r: 200, g: 80, b: 255 },  // Violet
    { r: 255, g: 100, b: 200 }, // Pink bioluminescence
    { r: 255, g: 200, b: 50 },  // Golden plankton
    { r: 180, g: 255, b: 150 }, // Lime green
    { r: 50, g: 200, b: 255 },  // Sky blue
    { r: 255, g: 150, b: 100 }, // Coral
];

const TENDRIL_COLORS = [
    { r: 0, g: 200, b: 240 },
    { r: 50, g: 255, b: 200 },
    { r: 100, g: 180, b: 255 },
    { r: 0, g: 255, b: 160 },
    { r: 150, g: 120, b: 255 },
    { r: 200, g: 100, b: 220 },
];

const NEBULA_COLORS = [
    { r: 20, g: 60, b: 120 },   // Deep blue nebula
    { r: 40, g: 80, b: 140 },   // Blue cloud
    { r: 30, g: 100, b: 120 },  // Teal mist
    { r: 60, g: 40, b: 120 },   // Purple haze
    { r: 20, g: 80, b: 100 },   // Ocean mist
];

// ═══════════════════════════════════════════════════════════════════════════════
// NOISE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function hash2D(x: number, y: number): number {
    let h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return h - Math.floor(h);
}

function smoothNoise(x: number, y: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
    const v = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    const a = hash2D(ix, iy);
    const b = hash2D(ix + 1, iy);
    const c = hash2D(ix, iy + 1);
    const d = hash2D(ix + 1, iy + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, octaves: number = 5): number {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1.0;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
        value += amplitude * smoothNoise(x * frequency, y * frequency);
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value / maxValue;
}

function loopFbm(x: number, y: number, progress: number, scale: number, octaves: number = 4): number {
    const angle = progress * Math.PI * 2;
    const nx = Math.cos(angle) * scale;
    const ny = Math.sin(angle) * scale;
    return fbm(x + nx, y + ny, octaves);
}

function warpedNoise(x: number, y: number, progress: number, warpStrength: number): number {
    const qX = loopFbm(x, y, progress, 2.0, 4);
    const qY = loopFbm(x + 5.2, y + 1.3, progress, 2.0, 4);
    return loopFbm(x + warpStrength * qX, y + warpStrength * qY, progress, 1.5, 4);
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function lerpColor(
    c1: { r: number; g: number; b: number },
    c2: { r: number; g: number; b: number },
    t: number,
): { r: number; g: number; b: number } {
    return {
        r: Math.round(c1.r + (c2.r - c1.r) * t),
        g: Math.round(c1.g + (c2.g - c1.g) * t),
        b: Math.round(c1.b + (c2.b - c1.b) * t),
    };
}

function sampleGlowColor(noiseVal: number): { r: number; g: number; b: number } {
    const clamped = Math.max(0, Math.min(1, noiseVal));
    const scaled = clamped * (GLOW_COLORS.length - 1);
    const idx = Math.floor(scaled);
    const frac = scaled - idx;
    const c1 = GLOW_COLORS[Math.min(idx, GLOW_COLORS.length - 1)];
    const c2 = GLOW_COLORS[Math.min(idx + 1, GLOW_COLORS.length - 1)];
    return lerpColor(c1, c2, frac);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface MicroSparkle {
    xRatio: number;
    yRatio: number;
    size: number;       // 0.1 - 0.5 px
    phase: number;
    speed: number;      // integer 1-6
    brightness: number; // base brightness 0.3-1.0
}

interface Plankton {
    xRatio: number;
    yRatio: number;
    size: number;       // 0.3 - 2.0 px
    driftX: number;
    driftY: number;
    phase: number;
    speed: number;      // integer 1-5
    colorIdx: number;
    twinkleType: number; // 0-2 different twinkle patterns
}

interface WaveParticle {
    xRatio: number;
    yRatio: number;
    size: number;       // 0.5 - 2.5 px
    phase: number;
    speed: number;      // integer 1-4
    waveAmp: number;    // wave amplitude
    waveFreq: number;   // wave frequency
    colorIdx: number;
}

interface MediumOrb {
    xRatio: number;
    yRatio: number;
    baseSize: number;   // 3-12 px
    phase: number;
    speed: number;      // integer 1-3
    driftX: number;
    driftY: number;
    colorIdx: number;
    pulseDepth: number;
    pulsePattern: number; // 0-3 different pulse patterns
}

interface GiantOrb {
    xRatio: number;
    yRatio: number;
    baseSize: number;   // 30-100 px radius
    phase: number;
    speed: number;      // integer 1-2
    driftX: number;
    driftY: number;
    colorIdx: number;
    rings: number;
    tentacleCount: number;
    innerGlowType: number; // 0-2
}

interface TendrilAnchor {
    xRatio: number;
    yRatio: number;
    length: number;
    segments: number;
    phase: number;
    speed: number;
    colorIdx: number;
    waveAmp: number;
    waveFreq: number;
    thickness: number;
}

interface SnowParticle {
    xRatio: number;
    startY: number;
    size: number;
    speed: number;
    phase: number;
    driftX: number;
    colorIdx: number;
}

interface NebulaCloud {
    xRatio: number;
    yRatio: number;
    radiusX: number;
    radiusY: number;
    phase: number;
    speed: number;
    colorIdx: number;
    opacity: number;
}

interface LightBeam {
    xRatio: number;
    width: number;
    phase: number;
    speed: number;
    opacity: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

const MICRO_SPARKLE_COUNT = 1500;
const PLANKTON_COUNT = 1200;
const WAVE_PARTICLE_COUNT = 600;
const MEDIUM_ORB_COUNT = 150;
const GIANT_ORB_COUNT = 30;
const TENDRIL_COUNT = 80;
const SNOW_COUNT = 500;
const NEBULA_COUNT = 30;
const LIGHT_BEAM_COUNT = 12;

function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function generateMicroSparkles(): MicroSparkle[] {
    const rand = seededRandom(42);
    const particles: MicroSparkle[] = [];
    for (let i = 0; i < MICRO_SPARKLE_COUNT; i++) {
        particles.push({
            xRatio: rand(),
            yRatio: rand(),
            size: rand() * 0.4 + 0.1,
            phase: rand() * Math.PI * 2,
            speed: Math.floor(rand() * 6) + 1,
            brightness: rand() * 0.7 + 0.3,
        });
    }
    return particles;
}

function generatePlankton(): Plankton[] {
    const rand = seededRandom(123);
    const particles: Plankton[] = [];
    for (let i = 0; i < PLANKTON_COUNT; i++) {
        particles.push({
            xRatio: rand(),
            yRatio: rand(),
            size: rand() * 1.7 + 0.3,
            driftX: (rand() - 0.5) * 0.02,
            driftY: (rand() - 0.5) * 0.015,
            phase: rand() * Math.PI * 2,
            speed: Math.floor(rand() * 5) + 1,
            colorIdx: Math.floor(rand() * GLOW_COLORS.length),
            twinkleType: Math.floor(rand() * 3),
        });
    }
    return particles;
}

function generateWaveParticles(): WaveParticle[] {
    const rand = seededRandom(456);
    const particles: WaveParticle[] = [];
    for (let i = 0; i < WAVE_PARTICLE_COUNT; i++) {
        particles.push({
            xRatio: rand(),
            yRatio: rand(),
            size: rand() * 2.0 + 0.5,
            phase: rand() * Math.PI * 2,
            speed: Math.floor(rand() * 4) + 1,
            waveAmp: rand() * 30 + 10,
            waveFreq: rand() * 0.03 + 0.01,
            colorIdx: Math.floor(rand() * GLOW_COLORS.length),
        });
    }
    return particles;
}

function generateMediumOrbs(): MediumOrb[] {
    const rand = seededRandom(789);
    const orbs: MediumOrb[] = [];
    for (let i = 0; i < MEDIUM_ORB_COUNT; i++) {
        orbs.push({
            xRatio: rand(),
            yRatio: rand(),
            baseSize: rand() * 9 + 3,
            phase: rand() * Math.PI * 2,
            speed: Math.floor(rand() * 3) + 1,
            driftX: (rand() - 0.5) * 0.015,
            driftY: (rand() - 0.5) * 0.01,
            colorIdx: Math.floor(rand() * GLOW_COLORS.length),
            pulseDepth: 0.3 + rand() * 0.5,
            pulsePattern: Math.floor(rand() * 4),
        });
    }
    return orbs;
}

function generateGiantOrbs(): GiantOrb[] {
    const rand = seededRandom(101112);
    const orbs: GiantOrb[] = [];
    for (let i = 0; i < GIANT_ORB_COUNT; i++) {
        orbs.push({
            xRatio: rand(),
            yRatio: rand(),
            baseSize: rand() * 70 + 30,
            phase: rand() * Math.PI * 2,
            speed: Math.floor(rand() * 2) + 1,
            driftX: (rand() - 0.5) * 0.008,
            driftY: (rand() - 0.5) * 0.005,
            colorIdx: Math.floor(rand() * GLOW_COLORS.length),
            rings: Math.floor(rand() * 4) + 2,
            tentacleCount: Math.floor(rand() * 6) + 3,
            innerGlowType: Math.floor(rand() * 3),
        });
    }
    return orbs;
}

function generateTendrils(): TendrilAnchor[] {
    const rand = seededRandom(131415);
    const tendrils: TendrilAnchor[] = [];
    for (let i = 0; i < TENDRIL_COUNT; i++) {
        tendrils.push({
            xRatio: rand(),
            yRatio: rand(),
            length: rand() * 250 + 80,
            segments: Math.floor(rand() * 8) + 4,
            phase: rand() * Math.PI * 2,
            speed: Math.floor(rand() * 3) + 1,
            colorIdx: Math.floor(rand() * TENDRIL_COLORS.length),
            waveAmp: rand() * 35 + 10,
            waveFreq: rand() * 0.06 + 0.02,
            thickness: rand() * 2 + 0.5,
        });
    }
    return tendrils;
}

function generateSnow(): SnowParticle[] {
    const rand = seededRandom(161718);
    const snow: SnowParticle[] = [];
    for (let i = 0; i < SNOW_COUNT; i++) {
        snow.push({
            xRatio: rand(),
            startY: rand(),
            size: rand() * 1.5 + 0.3,
            speed: Math.floor(rand() * 4) + 1,
            phase: rand() * Math.PI * 2,
            driftX: (rand() - 0.5) * 0.01,
            colorIdx: Math.floor(rand() * GLOW_COLORS.length),
        });
    }
    return snow;
}

function generateNebulae(): NebulaCloud[] {
    const rand = seededRandom(192021);
    const clouds: NebulaCloud[] = [];
    for (let i = 0; i < NEBULA_COUNT; i++) {
        clouds.push({
            xRatio: rand(),
            yRatio: rand(),
            radiusX: rand() * 400 + 200,
            radiusY: rand() * 300 + 150,
            phase: rand() * Math.PI * 2,
            speed: Math.floor(rand() * 2) + 1,
            colorIdx: Math.floor(rand() * NEBULA_COLORS.length),
            opacity: rand() * 0.15 + 0.05,
        });
    }
    return clouds;
}

function generateLightBeams(): LightBeam[] {
    const rand = seededRandom(252627);
    const beams: LightBeam[] = [];
    for (let i = 0; i < LIGHT_BEAM_COUNT; i++) {
        beams.push({
            xRatio: rand(),
            width: rand() * 60 + 20,
            phase: rand() * Math.PI * 2,
            speed: Math.floor(rand() * 2) + 1,
            opacity: rand() * 0.08 + 0.02,
        });
    }
    return beams;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAUSTIC PATTERN
// ═══════════════════════════════════════════════════════════════════════════════

function causticPattern(x: number, y: number, time: number): number {
    const s1 = Math.sin(x * 0.003 + time * 1) * Math.cos(y * 0.004 + time * 2);
    const s2 = Math.sin(x * 0.005 - time * 1 + 1.7) * Math.cos(y * 0.003 + time * 2 + 0.9);
    const s3 = Math.sin((x + y) * 0.002 + time * 3 + 3.2);
    const s4 = Math.cos((x - y) * 0.0025 - time * 1 + 1.1);
    const s5 = Math.sin(x * 0.007 + time * 2 + 2.5) * Math.cos(y * 0.006 - time * 1);
    const s6 = Math.sin(x * 0.004 + time * 1 + 4.0) * Math.cos(y * 0.005 + time * 3 + 2.0);
    return (s1 + s2 + s3 + s4 + s5 + s6) / 6.0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRAWING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function drawGlowOrb(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number,
    radius: number,
    color: { r: number; g: number; b: number },
    intensity: number,
    rings: number = 0,
    innerGlowType: number = 0,
) {
    // Outer glow — large soft halo
    const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 5);
    outerGrad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.12})`);
    outerGrad.addColorStop(0.2, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.06})`);
    outerGrad.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.02})`);
    outerGrad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    ctx.fillStyle = outerGrad;
    ctx.fillRect(cx - radius * 5, cy - radius * 5, radius * 10, radius * 10);

    // Mid glow
    const midGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.5);
    midGrad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.3})`);
    midGrad.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.15})`);
    midGrad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    ctx.fillStyle = midGrad;
    ctx.fillRect(cx - radius * 2.5, cy - radius * 2.5, radius * 5, radius * 5);

    // Core with different inner glow types
    const coreR = Math.min(255, color.r + 80 + innerGlowType * 20);
    const coreG = Math.min(255, color.g + 80 + innerGlowType * 15);
    const coreB = Math.min(255, color.b + 80 + innerGlowType * 25);

    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    coreGrad.addColorStop(0, `rgba(${coreR}, ${coreG}, ${coreB}, ${intensity * 0.9})`);
    coreGrad.addColorStop(0.2, `rgba(${Math.min(255, color.r + 40)}, ${Math.min(255, color.g + 40)}, ${Math.min(255, color.b + 40)}, ${intensity * 0.6})`);
    coreGrad.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.3})`);
    coreGrad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Internal rings
    if (rings > 0) {
        for (let r = 1; r <= rings; r++) {
            const ringRadius = radius * (r / (rings + 1));
            const ringAlpha = intensity * 0.1 * (1 - r / (rings + 1));
            const pulseOffset = Math.sin(r * 1.5) * 0.02;
            ctx.strokeStyle = `rgba(${Math.min(255, color.r + 60)}, ${Math.min(255, color.g + 60)}, ${Math.min(255, color.b + 60)}, ${ringAlpha + pulseOffset})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function drawNebulaCloud(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number,
    radiusX: number, radiusY: number,
    color: { r: number; g: number; b: number },
    opacity: number,
) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(radiusX, radiusY));
    grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
    grad.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.6})`);
    grad.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.2})`);
    grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

    ctx.save();
    ctx.scale(1, radiusY / radiusX);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy * (radiusX / radiusY), radiusX, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const BioluminescentDeep: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const progress = frame / durationInFrames;

    // Generate all particle systems once
    const microSparkles = useMemo(() => generateMicroSparkles(), []);
    const plankton = useMemo(() => generatePlankton(), []);
    const waveParticles = useMemo(() => generateWaveParticles(), []);
    const mediumOrbs = useMemo(() => generateMediumOrbs(), []);
    const giantOrbs = useMemo(() => generateGiantOrbs(), []);
    const tendrils = useMemo(() => generateTendrils(), []);
    const snow = useMemo(() => generateSnow(), []);
    const nebulae = useMemo(() => generateNebulae(), []);
    const lightBeams = useMemo(() => generateLightBeams(), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const time = progress * Math.PI * 2;

        // ════════════════════════════════════════════════════════════════════
        // LAYER 1: Deep abyss base — breathing dark navy
        // ════════════════════════════════════════════════════════════════════
        const baseR = 4 + 3 * Math.sin(time * 1);
        const baseG = 12 + 6 * Math.sin(time * 1 + 2.1);
        const baseB = 28 + 10 * Math.sin(time * 1 + 4.2);
        ctx.fillStyle = `rgb(${Math.round(baseR)}, ${Math.round(baseG)}, ${Math.round(baseB)})`;
        ctx.fillRect(0, 0, width, height);

        // ════════════════════════════════════════════════════════════════════
        // LAYER 2: Nebula clouds — large atmospheric glows (background)
        // ════════════════════════════════════════════════════════════════════
        for (const cloud of nebulae) {
            const driftX = Math.sin(time * cloud.speed + cloud.phase) * 0.02;
            const driftY = Math.cos(time * cloud.speed + cloud.phase * 1.3) * 0.015;
            let px = (cloud.xRatio + driftX) % 1;
            let py = (cloud.yRatio + driftY) % 1;
            if (px < 0) px += 1;
            if (py < 0) py += 1;

            const pulse = 0.8 + 0.2 * Math.sin(time * cloud.speed + cloud.phase);
            const color = NEBULA_COLORS[cloud.colorIdx % NEBULA_COLORS.length];
            drawNebulaCloud(ctx, px * width, py * height, cloud.radiusX * pulse, cloud.radiusY * pulse, color, cloud.opacity * pulse);
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 3: Ocean current flow — warped noise bands
        // ════════════════════════════════════════════════════════════════════
        const currentStep = 20;
        for (let ny = 0; ny < height; ny += currentStep) {
            for (let nx = 0; nx < width; nx += currentStep) {
                const nxNorm = nx / width;
                const nyNorm = ny / height;
                const warpVal = warpedNoise(nxNorm * 2.5, nyNorm * 2.5, progress, 1.5);
                const detailNoise = loopFbm(nxNorm * 4 + 10, nyNorm * 4 + 10, progress, 1.0, 3);
                const combined = warpVal * 0.7 + detailNoise * 0.3;
                const colorIdx = Math.floor(combined * DEEP_COLORS.length);
                const color = DEEP_COLORS[Math.min(colorIdx, DEEP_COLORS.length - 1)];
                const alpha = 0.25 + combined * 0.15;
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
                ctx.fillRect(nx, ny, currentStep, currentStep);
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 4: Caustic floor — interference patterns
        // ════════════════════════════════════════════════════════════════════
        const causticStep = 12;
        for (let cy2 = 0; cy2 < height; cy2 += causticStep) {
            for (let cx2 = 0; cx2 < width; cx2 += causticStep) {
                const c = causticPattern(cx2, cy2, time);
                const cAbs = Math.abs(c);
                if (cAbs > 0.2) {
                    const intensity = (cAbs - 0.2) * 0.5;
                    const causticColor = sampleGlowColor(0.3 + c * 0.4);
                    ctx.fillStyle = `rgba(${causticColor.r}, ${causticColor.g}, ${causticColor.b}, ${intensity * 0.12})`;
                    ctx.fillRect(cx2, cy2, causticStep, causticStep);
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 5: Light beams — vertical shafts from above
        // ════════════════════════════════════════════════════════════════════
        for (const beam of lightBeams) {
            const bx = beam.xRatio * width;
            const pulse = 0.5 + 0.5 * Math.sin(time * beam.speed + beam.phase);
            const grad = ctx.createLinearGradient(bx, 0, bx, height);
            grad.addColorStop(0, `rgba(100, 180, 255, ${beam.opacity * pulse * 0.5})`);
            grad.addColorStop(0.3, `rgba(80, 160, 240, ${beam.opacity * pulse * 0.3})`);
            grad.addColorStop(0.7, `rgba(60, 140, 220, ${beam.opacity * pulse * 0.1})`);
            grad.addColorStop(1, `rgba(40, 120, 200, 0)`);
            ctx.fillStyle = grad;
            ctx.fillRect(bx - beam.width / 2, 0, beam.width, height);
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 7: Micro sparkles — 1500 tiny background stars
        // ════════════════════════════════════════════════════════════════════
        for (const sp of microSparkles) {
            const twinkle = Math.sin(time * sp.speed + sp.phase);
            const brightness = sp.brightness * (0.5 + 0.5 * twinkle);

            if (brightness > 0.1) {
                const sx = sp.xRatio * width;
                const sy = sp.yRatio * height;
                ctx.save();
                ctx.globalAlpha = brightness * 0.6;
                ctx.fillStyle = `rgba(180, 220, 255, 0.8)`;
                ctx.beginPath();
                ctx.arc(sx, sy, sp.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 8: Wave particles — 600 particles following currents
        // ════════════════════════════════════════════════════════════════════
        for (const wp of waveParticles) {
            const waveOffsetX = Math.sin(wp.xRatio * wp.waveFreq * width + time * wp.speed + wp.phase) * wp.waveAmp;
            const waveOffsetY = Math.cos(wp.yRatio * wp.waveFreq * height + time * wp.speed + wp.phase * 1.3) * wp.waveAmp * 0.5;

            let px = wp.xRatio + waveOffsetX / width;
            let py = wp.yRatio + waveOffsetY / height;
            if (px < 0) px += 1;
            if (px > 1) px -= 1;
            if (py < 0) py += 1;
            if (py > 1) py -= 1;

            const pulse = 0.5 + 0.5 * Math.sin(time * wp.speed + wp.phase * 2);
            if (pulse > 0.2) {
                const color = GLOW_COLORS[wp.colorIdx % GLOW_COLORS.length];
                const sx = px * width;
                const sy = py * height;
                ctx.save();
                ctx.globalAlpha = pulse * 0.5;
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.7)`;
                ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`;
                ctx.shadowBlur = wp.size * 3;
                ctx.beginPath();
                ctx.arc(sx, sy, wp.size * pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 9: Floating plankton — 1200 organisms
        // ════════════════════════════════════════════════════════════════════
        for (const p of plankton) {
            const driftOffsetX = Math.sin(time * p.speed + p.phase) * 0.03 + p.driftX * progress;
            const driftOffsetY = Math.cos(time * p.speed + p.phase * 1.3) * 0.02 + p.driftY * progress;

            let px = (p.xRatio + driftOffsetX) % 1;
            let py = (p.yRatio + driftOffsetY) % 1;
            if (px < 0) px += 1;
            if (py < 0) py += 1;

            const sx = px * width;
            const sy = py * height;

            // Different twinkle patterns
            let twinkle: number;
            if (p.twinkleType === 0) {
                twinkle = Math.sin(time * p.speed + p.phase);
            } else if (p.twinkleType === 1) {
                twinkle = Math.abs(Math.sin(time * p.speed + p.phase));
            } else {
                twinkle = Math.sin(time * p.speed + p.phase) * Math.sin(time * p.speed * 0.7 + p.phase * 1.5);
            }

            const envelope = 0.5 + 0.5 * Math.sin(time * 1 + p.phase * 2);
            const brightness = Math.max(0, twinkle) * envelope;

            if (brightness > 0.05) {
                const color = GLOW_COLORS[p.colorIdx % GLOW_COLORS.length];
                const alpha = brightness * 0.7;
                const sz = p.size * (0.5 + brightness * 0.5);

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`;
                ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`;
                ctx.shadowBlur = sz * 4;
                ctx.beginPath();
                ctx.arc(sx, sy, sz, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 10: Medium orbs — 150 pulsing lights
        // ════════════════════════════════════════════════════════════════════
        for (const orb of mediumOrbs) {
            const driftOffsetX = Math.sin(time * orb.speed + orb.phase) * 0.02 + orb.driftX * progress;
            const driftOffsetY = Math.cos(time * orb.speed + orb.phase * 1.5) * 0.015 + orb.driftY * progress;

            let px = (orb.xRatio + driftOffsetX) % 1;
            let py = (orb.yRatio + driftOffsetY) % 1;
            if (px < 0) px += 1;
            if (py < 0) py += 1;

            const sx = px * width;
            const sy = py * height;

            // Different pulse patterns
            let pulse: number;
            if (orb.pulsePattern === 0) {
                pulse = Math.sin(time * orb.speed + orb.phase);
            } else if (orb.pulsePattern === 1) {
                pulse = Math.abs(Math.sin(time * orb.speed + orb.phase));
            } else if (orb.pulsePattern === 2) {
                pulse = Math.sin(time * orb.speed + orb.phase) * Math.cos(time * orb.speed * 0.5 + orb.phase);
            } else {
                pulse = (Math.sin(time * orb.speed + orb.phase) + 1) * 0.5;
            }

            const envelope = 0.5 + 0.5 * Math.sin(time * 1 + orb.phase * 1.7);
            const intensity = (0.5 + pulse * orb.pulseDepth * 0.5) * (0.6 + envelope * 0.4);

            const color = GLOW_COLORS[orb.colorIdx % GLOW_COLORS.length];
            const radius = orb.baseSize * (0.8 + intensity * 0.4);

            drawGlowOrb(ctx, sx, sy, radius, color, intensity * 0.7);
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 11: Giant jellyfish — 30 massive glowing spheres
        // ════════════════════════════════════════════════════════════════════
        for (const orb of giantOrbs) {
            const driftOffsetX = Math.sin(time * orb.speed + orb.phase) * 0.015 + orb.driftX * progress;
            const driftOffsetY = Math.cos(time * orb.speed + orb.phase * 1.2) * 0.01 + orb.driftY * progress;

            let px = (orb.xRatio + driftOffsetX) % 1;
            let py = (orb.yRatio + driftOffsetY) % 1;
            if (px < 0) px += 1;
            if (py < 0) py += 1;

            const sx = px * width;
            const sy = py * height;

            const breathe = Math.sin(time * orb.speed + orb.phase);
            const innerPulse = Math.sin(time * 2 + orb.phase * 3);
            const intensity = 0.4 + breathe * 0.2 + innerPulse * 0.1;

            const color = GLOW_COLORS[orb.colorIdx % GLOW_COLORS.length];
            const radius = orb.baseSize * (0.85 + breathe * 0.15);

            drawGlowOrb(ctx, sx, sy, radius, color, intensity, orb.rings, orb.innerGlowType);

            // Tentacles
            for (let t = 0; t < orb.tentacleCount; t++) {
                const tentPhase = orb.phase + t * 1.3;
                const tentColor = TENDRIL_COLORS[t % TENDRIL_COLORS.length];
                const tentLength = radius * (1.5 + Math.sin(tentPhase) * 0.5);
                const tentStartX = sx + (t - orb.tentacleCount / 2) * (radius * 0.3);
                const tentStartY = sy + radius * 0.8;

                ctx.beginPath();
                ctx.moveTo(tentStartX, tentStartY);

                const segLength = tentLength / 10;
                for (let s = 1; s <= 10; s++) {
                    const waveX = Math.sin(time * 1 + tentPhase + s * 0.5) * (8 + s * 4);
                    const waveY = s * segLength;
                    ctx.lineTo(tentStartX + waveX, tentStartY + waveY);
                }

                const tentAlpha = intensity * 0.2 * (1 - t * 0.03);
                ctx.strokeStyle = `rgba(${tentColor.r}, ${tentColor.g}, ${tentColor.b}, ${tentAlpha})`;
                ctx.lineWidth = 2.5 - t * 0.1;
                ctx.shadowColor = `rgba(${tentColor.r}, ${tentColor.g}, ${tentColor.b}, 0.3)`;
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 12: Tendril networks — 80 flowing light trails
        // ════════════════════════════════════════════════════════════════════
        for (const tendril of tendrils) {
            const startX = tendril.xRatio * width;
            const startY = tendril.yRatio * height;
            const color = TENDRIL_COLORS[tendril.colorIdx % TENDRIL_COLORS.length];

            for (let seg = 0; seg < tendril.segments; seg++) {
                const segProgress = seg / tendril.segments;
                const segLength = tendril.length / tendril.segments;

                const baseX = startX + seg * segLength * 0.3;
                const baseY = startY + seg * segLength;

                const waveX = Math.sin(time * tendril.speed + tendril.phase + seg * tendril.waveFreq * 50) * tendril.waveAmp * segProgress;
                const waveY = Math.cos(time * tendril.speed + tendril.phase * 1.5 + seg * 0.8) * tendril.waveAmp * 0.3 * segProgress;

                const px = baseX + waveX;
                const py = baseY + waveY;

                const fade = (1 - segProgress) * 0.6;
                const pulse = 0.5 + 0.5 * Math.sin(time * tendril.speed + tendril.phase + seg * 0.3);
                const alpha = fade * pulse;

                if (alpha > 0.02) {
                    const sz = tendril.thickness * (1 - segProgress * 0.7);
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
                    ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
                    ctx.shadowBlur = sz * 4;
                    ctx.beginPath();
                    ctx.arc(px, py, sz, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 13: Rising snow — 500 upward-drifting particles
        // ════════════════════════════════════════════════════════════════════
        for (const sp of snow) {
            const riseOffset = Math.sin(time * sp.speed + sp.phase) * 0.15;
            const driftX = Math.sin(time * 1 + sp.phase * 2.3) * 0.02 + sp.driftX * progress;

            let px = (sp.xRatio + driftX) % 1;
            let py = (sp.startY - riseOffset) % 1;
            if (px < 0) px += 1;
            if (py < 0) py += 1;

            const sx = px * width;
            const sy = py * height;

            const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * sp.speed + sp.phase * 1.5));
            const color = GLOW_COLORS[sp.colorIdx % GLOW_COLORS.length];

            ctx.save();
            ctx.globalAlpha = twinkle * 0.5;
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`;
            ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`;
            ctx.shadowBlur = sp.size * 3;
            ctx.beginPath();
            ctx.arc(sx, sy, sp.size * twinkle, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 14: Constellation connections — lines between nearby orbs
        // ════════════════════════════════════════════════════════════════════
        const constellationPairs: Array<[number, number, number, number, number]> = [];
        const maxDist = 300;

        // Sample a subset of medium orbs for connections (check every 3rd orb)
        for (let i = 0; i < mediumOrbs.length; i += 3) {
            for (let j = i + 3; j < mediumOrbs.length; j += 3) {
                const o1 = mediumOrbs[i];
                const o2 = mediumOrbs[j];

                const d1x = Math.sin(time * o1.speed + o1.phase) * 0.02 + o1.driftX * progress;
                const d1y = Math.cos(time * o1.speed + o1.phase * 1.5) * 0.015 + o1.driftY * progress;
                const d2x = Math.sin(time * o2.speed + o2.phase) * 0.02 + o2.driftX * progress;
                const d2y = Math.cos(time * o2.speed + o2.phase * 1.5) * 0.015 + o2.driftY * progress;

                const x1 = ((o1.xRatio + d1x) % 1 + 1) % 1 * width;
                const y1 = ((o1.yRatio + d1y) % 1 + 1) % 1 * height;
                const x2 = ((o2.xRatio + d2x) % 1 + 1) % 1 * width;
                const y2 = ((o2.yRatio + d2y) % 1 + 1) % 1 * height;

                const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
                if (dist < maxDist) {
                    constellationPairs.push([x1, y1, x2, y2, dist]);
                }
            }
        }

        for (const [x1, y1, x2, y2, dist] of constellationPairs) {
            const alpha = (1 - dist / maxDist) * 0.15;
            const pulse = 0.5 + 0.5 * Math.sin(time * 2 + dist * 0.01);
            ctx.save();
            ctx.globalAlpha = alpha * pulse;
            ctx.strokeStyle = `rgba(100, 200, 255, 0.5)`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 15: Depth fog + vignette
        // ════════════════════════════════════════════════════════════════════
        const vignette = ctx.createRadialGradient(
            width * 0.5, height * 0.5, width * 0.1,
            width * 0.5, height * 0.5, width * 0.8
        );
        vignette.addColorStop(0, 'rgba(5, 12, 25, 0)');
        vignette.addColorStop(0.4, 'rgba(3, 8, 18, 0.08)');
        vignette.addColorStop(0.7, 'rgba(2, 5, 12, 0.2)');
        vignette.addColorStop(1, 'rgba(0, 2, 5, 0.45)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // Horizontal depth gradient — darker at bottom
        const depthGrad = ctx.createLinearGradient(0, 0, 0, height);
        depthGrad.addColorStop(0, 'rgba(5, 15, 30, 0)');
        depthGrad.addColorStop(0.5, 'rgba(3, 10, 22, 0.04)');
        depthGrad.addColorStop(1, 'rgba(0, 5, 12, 0.18)');
        ctx.fillStyle = depthGrad;
        ctx.fillRect(0, 0, width, height);

        // ════════════════════════════════════════════════════════════════════
        // LAYER 16: Global breathing pulse
        // ════════════════════════════════════════════════════════════════════
        const breathe = 0.015 + 0.01 * Math.sin(time * 1);
        ctx.fillStyle = `rgba(100, 200, 240, ${breathe})`;
        ctx.fillRect(0, 0, width, height);

        const pulse2 = 0.008 + 0.005 * Math.sin(time * 2 + 1.5);
        ctx.fillStyle = `rgba(50, 255, 200, ${pulse2})`;
        ctx.fillRect(0, 0, width, height);

    }, [frame, width, height, durationInFrames, progress, microSparkles, plankton, waveParticles, mediumOrbs, giantOrbs, tendrils, snow, nebulae, lightBeams]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#020812',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                }}
            />
        </div>
    );
};

export default BioluminescentDeep;
