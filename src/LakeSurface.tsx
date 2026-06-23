import React, { useRef, useMemo, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * ============================================================================
 * LAKE SURFACE — Top-down view of a pastel-colored lake
 *
 * Visual concept:
 *   The camera looks straight down at a calm lake. The water surface shows
 *   gentle ripples, soft caustic light patterns, and subtle color shifts
 *   between 5 pastel hues. The overall feel is dreamy, meditative, and
 *   organic — like looking at a real alpine lake from a drone.
 *
 * 5 Pastel Colors:
 *   1. Soft Mint       #A8E6CF
 *   2. Powder Blue     #B8D4E3
 *   3. Lavender Mist   #C3B1E1
 *   4. Peach Blush     #F5C6AA
 *   5. Pale Rose       #F2B5D4
 *
 * Layers (back to front):
 *   1. Base gradient — 5-color radial blend that slowly rotates
 *   2. Noise color field — organic color mixing via fbm noise
 *   3. Ripple rings — concentric expanding rings from multiple sources
 *   4. Caustic network — overlapping sine interference patterns
 *   5. Surface shimmer — fine-grain sparkle highlights
 *   6. Depth fog — subtle vignette + depth haze
 *
 * Seamless loop: all animations parameterized by (frame/duration) × 2π
 * ============================================================================
 */

export const VIDEO_CONFIG = {
    width: 3840,
    height: 2160,
    fps: 60,
    durationInFrames: 600, // 10 seconds
};

// ─── 5 Pastel Lake Colors ──────────────────────────────────────────────────
const PASTEL_COLORS = [
    { r: 168, g: 230, b: 207, name: 'Mint' },       // #A8E6CF
    { r: 184, g: 212, b: 227, name: 'Powder Blue' }, // #B8D4E3
    { r: 195, g: 177, b: 225, name: 'Lavender' },    // #C3B1E1
    { r: 245, g: 198, b: 170, name: 'Peach' },       // #F5C6AA
    { r: 242, g: 181, b: 212, name: 'Pale Rose' },   // #F2B5D4
];

// ─── Hash-based noise (no external dependencies) ───────────────────────────
function hash2D(x: number, y: number): number {
    let h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return h - Math.floor(h);
}

function smoothNoise(x: number, y: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    // Quintic smoothstep for smoother gradients
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

// ─── Seamless-loop noise using circular parameterization ────────────────────
function loopFbm(x: number, y: number, progress: number, scale: number, octaves: number = 4): number {
    const angle = progress * Math.PI * 2;
    const nx = Math.cos(angle) * scale;
    const ny = Math.sin(angle) * scale;
    return fbm(x + nx, y + ny, octaves);
}

// ─── Domain warping for organic color mixing ────────────────────────────────
function warpedNoise(x: number, y: number, progress: number, warpStrength: number): number {
    const qX = loopFbm(x, y, progress, 2.0, 4);
    const qY = loopFbm(x + 5.2, y + 1.3, progress, 2.0, 4);
    return loopFbm(x + warpStrength * qX, y + warpStrength * qY, progress, 1.5, 4);
}

// ─── Ripple ring function ───────────────────────────────────────────────────
function rippleRing(
    px: number, py: number,
    cx: number, cy: number,
    time: number,
    wavelength: number,
    decay: number,
): number {
    const dx = px - cx;
    const dy = py - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const wave = Math.sin(dist * wavelength - time * 8.0);
    const attenuation = Math.exp(-dist * decay);
    return wave * attenuation;
}

// ─── Caustic interference ───────────────────────────────────────────────────
function causticPattern(x: number, y: number, t: number): number {
    const s1 = Math.sin(x * 0.004 + t * 0.6) * Math.cos(y * 0.005 + t * 0.4);
    const s2 = Math.sin(x * 0.006 - t * 0.3 + 1.7) * Math.cos(y * 0.004 + t * 0.7 + 0.9);
    const s3 = Math.sin((x + y) * 0.003 + t * 0.5 + 3.2);
    const s4 = Math.cos((x - y) * 0.0035 - t * 0.45 + 1.1);
    return (s1 + s2 + s3 + s4) / 4.0;
}

// ─── Ripple source positions (seeded, stable) ──────────────────────────────
interface RippleSource {
    xRatio: number;
    yRatio: number;
    speedFactor: number;
    wavelength: number;
    decay: number;
    phaseOffset: number;
}

const RIPPLE_SOURCES: RippleSource[] = [
    { xRatio: 0.25, yRatio: 0.3, speedFactor: 1.0, wavelength: 0.015, decay: 0.0008, phaseOffset: 0 },
    { xRatio: 0.7, yRatio: 0.2, speedFactor: 0.8, wavelength: 0.012, decay: 0.0006, phaseOffset: 1.5 },
    { xRatio: 0.5, yRatio: 0.6, speedFactor: 1.2, wavelength: 0.018, decay: 0.001, phaseOffset: 3.0 },
    { xRatio: 0.15, yRatio: 0.75, speedFactor: 0.9, wavelength: 0.014, decay: 0.0007, phaseOffset: 4.5 },
    { xRatio: 0.85, yRatio: 0.55, speedFactor: 1.1, wavelength: 0.016, decay: 0.0009, phaseOffset: 2.2 },
    { xRatio: 0.4, yRatio: 0.15, speedFactor: 0.7, wavelength: 0.013, decay: 0.0005, phaseOffset: 5.8 },
    { xRatio: 0.6, yRatio: 0.85, speedFactor: 1.0, wavelength: 0.017, decay: 0.0008, phaseOffset: 0.8 },
    { xRatio: 0.9, yRatio: 0.4, speedFactor: 0.85, wavelength: 0.011, decay: 0.0006, phaseOffset: 3.7 },
];

// ─── Shimmer sparkle particles ──────────────────────────────────────────────
interface Sparkle {
    xRatio: number;
    yRatio: number;
    size: number;
    phase: number;
    speed: number;
}

const SPARKLE_COUNT = 120;

function generateSparkles(): Sparkle[] {
    const sparkles: Sparkle[] = [];
    for (let i = 0; i < SPARKLE_COUNT; i++) {
        const s1 = Math.sin(i * 43758.5453) * 0.5 + 0.5;
        const s2 = Math.cos(i * 12.9898 + 7.0) * 0.5 + 0.5;
        const s3 = Math.sin(i * 98.412 + 3.0) * 0.5 + 0.5;
        sparkles.push({
            xRatio: s1,
            yRatio: s2,
            size: s3 * 3 + 1,
            phase: s2 * Math.PI * 2,
            speed: 0.5 + s3 * 1.5,
        });
    }
    return sparkles;
}

// ─── Color interpolation helper ─────────────────────────────────────────────
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

function samplePastelColor(noiseVal: number): { r: number; g: number; b: number } {
    // Map 0..1 noise to 5 colors with smooth blending
    const scaled = noiseVal * (PASTEL_COLORS.length - 1);
    const idx = Math.floor(scaled);
    const frac = scaled - idx;
    const c1 = PASTEL_COLORS[Math.min(idx, PASTEL_COLORS.length - 1)];
    const c2 = PASTEL_COLORS[Math.min(idx + 1, PASTEL_COLORS.length - 1)];
    return lerpColor(c1, c2, frac);
}

// ─── Main Component ─────────────────────────────────────────────────────────
export const LakeSurface: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const progress = frame / durationInFrames;
    const sparkles = useMemo(() => generateSparkles(), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const t = progress; // 0..1
        const TAU = Math.PI * 2;
        const time = t * TAU; // full cycle

        // ════════════════════════════════════════════════════════════════════
        // LAYER 1: Base gradient — 5-color blend that slowly rotates
        // ════════════════════════════════════════════════════════════════════
        const rotation = t * TAU; // full rotation over loop
        const cx = width * 0.5;
        const cy = height * 0.5;

        // Create rotating radial gradient with multiple color stops
        const baseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.6);
        const colorStops = 5;
        for (let i = 0; i <= colorStops; i++) {
            const angle = (i / colorStops) * TAU + rotation;
            const colorIdx = i % PASTEL_COLORS.length;
            const c = PASTEL_COLORS[colorIdx];
            const stop = i / colorStops;
            baseGrad.addColorStop(
                Math.min(stop, 1),
                `rgba(${c.r}, ${c.g}, ${c.b}, 0.6)`
            );
        }
        ctx.fillStyle = baseGrad;
        ctx.fillRect(0, 0, width, height);

        // Second gradient layer — offset for complexity
        const baseGrad2 = ctx.createRadialGradient(
            cx + Math.cos(time * 0.7) * width * 0.15,
            cy + Math.sin(time * 0.5) * height * 0.15,
            0,
            cx, cy, width * 0.5
        );
        for (let i = 0; i <= colorStops; i++) {
            const angle = (i / colorStops) * TAU + rotation + 1.2;
            const colorIdx = (i + 2) % PASTEL_COLORS.length;
            const c = PASTEL_COLORS[colorIdx];
            const stop = i / colorStops;
            baseGrad2.addColorStop(
                Math.min(stop, 1),
                `rgba(${c.r}, ${c.g}, ${c.b}, 0.35)`
            );
        }
        ctx.fillStyle = baseGrad2;
        ctx.fillRect(0, 0, width, height);

        // ════════════════════════════════════════════════════════════════════
        // LAYER 2: Noise color field — organic pastel mixing
        // ════════════════════════════════════════════════════════════════════
        const noiseStep = 8; // pixel step for performance
        for (let ny = 0; ny < height; ny += noiseStep) {
            for (let nx = 0; nx < width; nx += noiseStep) {
                const nxNorm = nx / width;
                const nyNorm = ny / height;

                // Domain-warped noise for organic shapes
                const warpVal = warpedNoise(
                    nxNorm * 4,
                    nyNorm * 4,
                    t,
                    1.5
                );

                // Second noise layer at different scale
                const detailNoise = loopFbm(
                    nxNorm * 8 + 10,
                    nyNorm * 8 + 10,
                    t,
                    1.0,
                    3
                );

                // Combine for final color selection
                const combined = warpVal * 0.7 + detailNoise * 0.3;
                const color = samplePastelColor(combined);

                // Vary opacity for depth
                const alpha = 0.15 + 0.1 * detailNoise;

                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
                ctx.fillRect(nx, ny, noiseStep, noiseStep);
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 3: Ripple rings — concentric waves from multiple sources
        // ════════════════════════════════════════════════════════════════════
        const rippleStep = 6;
        for (let ry = 0; ry < height; ry += rippleStep) {
            for (let rx = 0; rx < width; rx += rippleStep) {
                let totalRipple = 0;

                for (const src of RIPPLE_SOURCES) {
                    const srcX = src.xRatio * width;
                    const srcY = src.yRatio * height;
                    const rippleTime = time * src.speedFactor + src.phaseOffset;
                    const ripple = rippleRing(
                        rx, ry, srcX, srcY,
                        rippleTime,
                        src.wavelength,
                        src.decay,
                    );
                    totalRipple += ripple;
                }

                // Normalize and map to pastel color shift
                totalRipple = totalRipple / RIPPLE_SOURCES.length;
                const rippleAbs = Math.abs(totalRipple);

                if (rippleAbs > 0.02) {
                    // Ripple highlights — lighter pastel
                    const highlightColor = samplePastelColor(0.5 + totalRipple * 0.3);
                    const alpha = rippleAbs * 0.2;
                    ctx.fillStyle = `rgba(${highlightColor.r}, ${highlightColor.g}, ${highlightColor.b}, ${alpha})`;
                    ctx.fillRect(rx, ry, rippleStep, rippleStep);
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 4: Caustic light network
        // ════════════════════════════════════════════════════════════════════
        const causticStep = 10;
        for (let cy2 = 0; cy2 < height; cy2 += causticStep) {
            for (let cx2 = 0; cx2 < width; cx2 += causticStep) {
                const c = causticPattern(cx2, cy2, time);
                const cAbs = Math.abs(c);

                if (cAbs > 0.25) {
                    const intensity = (cAbs - 0.25) * 0.4;
                    // Caustics appear as bright pastel lines
                    const causticColor = samplePastelColor(0.3 + c * 0.4);
                    ctx.fillStyle = `rgba(${causticColor.r}, ${causticColor.g}, ${causticColor.b}, ${intensity})`;
                    ctx.fillRect(cx2, cy2, causticStep, causticStep);
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 5: Surface shimmer sparkles
        // ════════════════════════════════════════════════════════════════════
        for (const sp of sparkles) {
            const sx = sp.xRatio * width;
            const sy = sp.yRatio * height;

            // Twinkle: fast oscillation with slow envelope
            const twinkle = Math.sin(time * sp.speed * 3 + sp.phase);
            const envelope = 0.5 + 0.5 * Math.sin(time * 0.5 + sp.phase * 2);
            const brightness = Math.max(0, twinkle) * envelope;

            if (brightness > 0.1) {
                const alpha = brightness * 0.5;
                const sparkleColor = PASTEL_COLORS[Math.floor(sp.phase) % PASTEL_COLORS.length];

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = `rgba(${sparkleColor.r}, ${sparkleColor.g}, ${sparkleColor.b}, 0.9)`;
                ctx.shadowColor = `rgba(${sparkleColor.r}, ${sparkleColor.g}, ${sparkleColor.b}, 0.6)`;
                ctx.shadowBlur = sp.size * 5;
                ctx.beginPath();
                ctx.arc(sx, sy, sp.size * brightness, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 6: Depth fog + vignette
        // ════════════════════════════════════════════════════════════════════

        // Soft radial vignette
        const vignette = ctx.createRadialGradient(
            width * 0.5, height * 0.5, width * 0.2,
            width * 0.5, height * 0.5, width * 0.7
        );
        vignette.addColorStop(0, 'rgba(200, 220, 230, 0)');
        vignette.addColorStop(0.5, 'rgba(180, 200, 215, 0.05)');
        vignette.addColorStop(1, 'rgba(160, 185, 200, 0.2)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // Subtle overall brightness pulse
        const pulse = 0.02 + 0.015 * Math.sin(time * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
        ctx.fillRect(0, 0, width, height);

    }, [frame, width, height, durationInFrames, progress, sparkles]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#B8D4E3',
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

export default LakeSurface;
