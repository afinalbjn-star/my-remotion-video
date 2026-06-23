import React, { useRef, useMemo, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * ============================================================================
 * LAKE SURFACE — Top-down view of a pastel-colored lake (v2 — realistic water)
 *
 * Visual concept:
 *   Camera looks straight down at a calm alpine lake. The water is rich and
 *   saturated with deep pastel tones. Organic wave patterns flow across the
 *   surface, caustic light dances on the bottom, and gentle ripples expand
 *   from multiple sources. The overall feel is a real, living body of water
 *   seen from above — not abstract, not washed out.
 *
 * 5 Pastel Colors (saturated, rich):
 *   1. Deep Teal       #3D9B8F
 *   2. Ocean Blue      #4A90B8
 *   3. Deep Lavender   #7B68AE
 *   4. Warm Coral      #D4845A
 *   5. Rose Water      #C76B98
 *
 * Layers (back to front):
 *   1. Base fill — deep saturated water color
 *   2. Large-scale color zones — organic blobs of the 5 colors
 *   3. Wave distortion — flowing sine-based wave patterns
 *   4. Ripple rings — concentric expanding rings from multiple sources
 *   5. Caustic network — bright light patterns on the lake floor
 *   6. Surface highlights — specular reflections and shimmer
 *   7. Depth + vignette — dark edges, depth fog
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

// ─── 5 Rich Pastel Lake Colors ──────────────────────────────────────────────
const PASTEL_COLORS = [
    { r: 61, g: 155, b: 143, name: 'Deep Teal' },       // #3D9B8F
    { r: 74, g: 144, b: 184, name: 'Ocean Blue' },       // #4A90B8
    { r: 123, g: 104, b: 174, name: 'Deep Lavender' },   // #7B68AE
    { r: 212, g: 132, b: 90, name: 'Warm Coral' },       // #D4845A
    { r: 199, g: 107, b: 152, name: 'Rose Water' },      // #C76B98
];

// Lighter highlight versions for caustics and shimmer
const HIGHLIGHT_COLORS = [
    { r: 120, g: 210, b: 195, name: 'Light Teal' },
    { r: 130, g: 195, b: 230, name: 'Light Blue' },
    { r: 175, g: 160, b: 220, name: 'Light Lavender' },
    { r: 245, g: 190, b: 155, name: 'Light Coral' },
    { r: 235, g: 170, b: 200, name: 'Light Rose' },
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

// ─── Ripple source positions ────────────────────────────────────────────────
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

const SPARKLE_COUNT = 150;

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
    const clamped = Math.max(0, Math.min(1, noiseVal));
    const scaled = clamped * (PASTEL_COLORS.length - 1);
    const idx = Math.floor(scaled);
    const frac = scaled - idx;
    const c1 = PASTEL_COLORS[Math.min(idx, PASTEL_COLORS.length - 1)];
    const c2 = PASTEL_COLORS[Math.min(idx + 1, PASTEL_COLORS.length - 1)];
    return lerpColor(c1, c2, frac);
}

function sampleHighlightColor(noiseVal: number): { r: number; g: number; b: number } {
    const clamped = Math.max(0, Math.min(1, noiseVal));
    const scaled = clamped * (HIGHLIGHT_COLORS.length - 1);
    const idx = Math.floor(scaled);
    const frac = scaled - idx;
    const c1 = HIGHLIGHT_COLORS[Math.min(idx, HIGHLIGHT_COLORS.length - 1)];
    const c2 = HIGHLIGHT_COLORS[Math.min(idx + 1, HIGHLIGHT_COLORS.length - 1)];
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

        const t = progress;
        const TAU = Math.PI * 2;
        const time = t * TAU;

        // ════════════════════════════════════════════════════════════════════
        // LAYER 1: Deep saturated base fill
        // ════════════════════════════════════════════════════════════════════
        // Rich teal-blue base that looks like real water
        const baseR = 45 + 15 * Math.sin(time * 0.3);
        const baseG = 120 + 20 * Math.sin(time * 0.4 + 1.0);
        const baseB = 145 + 15 * Math.sin(time * 0.5 + 2.0);
        ctx.fillStyle = `rgb(${Math.round(baseR)}, ${Math.round(baseG)}, ${Math.round(baseB)})`;
        ctx.fillRect(0, 0, width, height);

        // ════════════════════════════════════════════════════════════════════
        // LAYER 2: Large-scale organic color zones
        // ════════════════════════════════════════════════════════════════════
        // Big flowing blobs of the 5 colors — like real lake color variation
        const zoneStep = 12;
        for (let ny = 0; ny < height; ny += zoneStep) {
            for (let nx = 0; nx < width; nx += zoneStep) {
                const nxNorm = nx / width;
                const nyNorm = ny / height;

                // Domain-warped noise for organic shapes
                const warpVal = warpedNoise(
                    nxNorm * 3,
                    nyNorm * 3,
                    t,
                    2.0
                );

                // Second noise layer at different scale
                const detailNoise = loopFbm(
                    nxNorm * 6 + 10,
                    nyNorm * 6 + 10,
                    t,
                    1.5,
                    4
                );

                // Combine for final color selection
                const combined = warpVal * 0.65 + detailNoise * 0.35;
                const color = samplePastelColor(combined);

                // Rich, saturated opacity — this is the main color layer
                const alpha = 0.55 + 0.15 * detailNoise;

                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
                ctx.fillRect(nx, ny, zoneStep, zoneStep);
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 3: Flowing wave patterns — the key water texture
        // ════════════════════════════════════════════════════════════════════
        // Multiple overlapping sine waves create the illusion of water surface
        const waveStep = 4;
        for (let wy = 0; wy < height; wy += waveStep) {
            for (let wx = 0; wx < width; wx += waveStep) {
                const x = wx / width;
                const y = wy / height;

                // 3 wave directions for realistic water surface
                const wave1 = Math.sin(x * 12 + time * 1.2 + y * 3) * 0.5;
                const wave2 = Math.sin(y * 10 - time * 0.8 + x * 4 + 2.0) * 0.4;
                const wave3 = Math.sin((x + y) * 8 + time * 0.6 + 4.0) * 0.3;

                // Diagonal swell
                const swell = Math.sin((x * 0.7 + y * 0.3) * 15 - time * 1.5) * 0.35;

                const totalWave = (wave1 + wave2 + wave3 + swell) / 1.55;

                // Waves create light/dark bands
                if (totalWave > 0.1) {
                    // Bright wave crest — lighter color
                    const brightness = (totalWave - 0.1) * 1.2;
                    const waveColor = sampleHighlightColor(0.3 + totalWave * 0.4);
                    ctx.fillStyle = `rgba(${waveColor.r}, ${waveColor.g}, ${waveColor.b}, ${brightness * 0.35})`;
                    ctx.fillRect(wx, wy, waveStep, waveStep);
                } else if (totalWave < -0.1) {
                    // Dark wave trough — deeper color
                    const depth = (-totalWave - 0.1) * 1.2;
                    ctx.fillStyle = `rgba(20, 50, 70, ${depth * 0.25})`;
                    ctx.fillRect(wx, wy, waveStep, waveStep);
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 4: Ripple rings — concentric waves from multiple sources
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

                totalRipple = totalRipple / RIPPLE_SOURCES.length;
                const rippleAbs = Math.abs(totalRipple);

                if (rippleAbs > 0.02) {
                    // Ripple highlights — bright pastel
                    const highlightColor = sampleHighlightColor(0.5 + totalRipple * 0.3);
                    const alpha = rippleAbs * 0.35;
                    ctx.fillStyle = `rgba(${highlightColor.r}, ${highlightColor.g}, ${highlightColor.b}, ${alpha})`;
                    ctx.fillRect(rx, ry, rippleStep, rippleStep);
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 5: Caustic light network — bright patterns on lake floor
        // ════════════════════════════════════════════════════════════════════
        const causticStep = 8;
        for (let cy2 = 0; cy2 < height; cy2 += causticStep) {
            for (let cx2 = 0; cx2 < width; cx2 += causticStep) {
                const c = causticPattern(cx2, cy2, time);
                const cAbs = Math.abs(c);

                if (cAbs > 0.2) {
                    const intensity = (cAbs - 0.2) * 0.6;
                    const causticColor = sampleHighlightColor(0.3 + c * 0.4);
                    ctx.fillStyle = `rgba(${causticColor.r}, ${causticColor.g}, ${causticColor.b}, ${intensity})`;
                    ctx.fillRect(cx2, cy2, causticStep, causticStep);
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 6: Surface highlights and shimmer
        // ════════════════════════════════════════════════════════════════════
        for (const sp of sparkles) {
            const sx = sp.xRatio * width;
            const sy = sp.yRatio * height;

            const twinkle = Math.sin(time * sp.speed * 3 + sp.phase);
            const envelope = 0.5 + 0.5 * Math.sin(time * 0.5 + sp.phase * 2);
            const brightness = Math.max(0, twinkle) * envelope;

            if (brightness > 0.1) {
                const alpha = brightness * 0.6;
                const sparkleColor = HIGHLIGHT_COLORS[Math.floor(sp.phase) % HIGHLIGHT_COLORS.length];

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = `rgba(${sparkleColor.r}, ${sparkleColor.g}, ${sparkleColor.b}, 0.9)`;
                ctx.shadowColor = `rgba(${sparkleColor.r}, ${sparkleColor.g}, ${sparkleColor.b}, 0.7)`;
                ctx.shadowBlur = sp.size * 6;
                ctx.beginPath();
                ctx.arc(sx, sy, sp.size * brightness, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // LAYER 7: Depth fog + vignette
        // ════════════════════════════════════════════════════════════════════

        // Strong vignette for depth
        const vignette = ctx.createRadialGradient(
            width * 0.5, height * 0.5, width * 0.15,
            width * 0.5, height * 0.5, width * 0.75
        );
        vignette.addColorStop(0, 'rgba(30, 60, 80, 0)');
        vignette.addColorStop(0.5, 'rgba(20, 45, 65, 0.1)');
        vignette.addColorStop(1, 'rgba(10, 25, 40, 0.35)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // Subtle overall brightness pulse — like sunlight through clouds
        const pulse = 0.03 + 0.02 * Math.sin(time * 2);
        ctx.fillStyle = `rgba(200, 230, 240, ${pulse})`;
        ctx.fillRect(0, 0, width, height);

    }, [frame, width, height, durationInFrames, progress, sparkles]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#2D7A8A',
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
