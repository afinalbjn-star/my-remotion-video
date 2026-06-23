import React, { useRef, useMemo, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * ============================================================================
 * DARK WAVES v2 — Complex abstract dark waves with teal highlights
 *
 * Layers:
 *   1. Deep noise-driven color field (slowly morphing dark teal clouds)
 *   2. 12+ flowing ribbon wave layers with harmonics + noise displacement
 *   3. Mesh grid distortion overlay (subtle warping grid lines)
 *   4. Caustic light patterns (overlapping sine interference)
 *   5. Particle field with trails (200+ particles)
 *   6. Horizontal light streaks with animated shimmer
 *   7. Vignette + ambient glow hotspots
 *
 * All animations use `progress * 2π * N` so frame 0 == frame 600.
 * ============================================================================
 */

export const VIDEO_CONFIG = {
    width: 3840,
    height: 2160,
    fps: 60,
    durationInFrames: 600,
};

// ─── Simple hash-based noise (no external deps) ────────────────────────────
function hash(x: number, y: number): number {
    let h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return h - Math.floor(h);
}

function smoothNoise(x: number, y: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    // smoothstep
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy);
    const b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1);
    const d = hash(ix + 1, iy + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, octaves: number = 4): number {
    let val = 0;
    let amp = 0.5;
    let freq = 1;
    for (let i = 0; i < octaves; i++) {
        val += amp * smoothNoise(x * freq, y * freq);
        amp *= 0.5;
        freq *= 2.0;
    }
    return val;
}

// ─── Seamless-loop-aware noise: wraps phase so t=0 == t=1 ──────────────────
function loopNoise(x: number, y: number, progress: number, scale: number): number {
    // Use circular parameterization so noise wraps seamlessly
    const angle = progress * Math.PI * 2;
    const nx = Math.cos(angle) * scale;
    const ny = Math.sin(angle) * scale;
    return fbm(x + nx, y + ny, 4);
}

// ─── Wave layer config ─────────────────────────────────────────────────────
interface WaveLayer {
    baseYRatio: number;
    amplitude: number;
    frequency: number;
    speedFactor: number;
    loopCycles: number;
    harmonics: number;
    noiseDisplace: number;
    noiseScale: number;
    lineWidth: number;
    opacity: number;
    color: string;
    glowColor: string;
    glowBlur: number;
    strandCount: number;
    strandSpacing: number;
    phaseOffset: number;
}

const WAVE_LAYERS: WaveLayer[] = [
    // ── Deep background waves ──
    { baseYRatio: 0.5, amplitude: 350, frequency: 0.0003, speedFactor: 0.2, loopCycles: 1, harmonics: 5, noiseDisplace: 80, noiseScale: 0.8, lineWidth: 0.5, opacity: 0.08, color: 'rgba(8, 25, 32, 0.9)', glowColor: 'rgba(12, 40, 50, 0.06)', glowBlur: 50, strandCount: 10, strandSpacing: 35, phaseOffset: 0 },
    { baseYRatio: 0.48, amplitude: 280, frequency: 0.0004, speedFactor: -0.25, loopCycles: 1, harmonics: 4, noiseDisplace: 60, noiseScale: 1.0, lineWidth: 0.5, opacity: 0.07, color: 'rgba(10, 28, 35, 0.85)', glowColor: 'rgba(15, 45, 55, 0.05)', glowBlur: 45, strandCount: 8, strandSpacing: 30, phaseOffset: 1.2 },
    // ── Mid-layer teal waves ──
    { baseYRatio: 0.42, amplitude: 200, frequency: 0.0006, speedFactor: 0.5, loopCycles: 1, harmonics: 4, noiseDisplace: 50, noiseScale: 1.2, lineWidth: 0.7, opacity: 0.18, color: 'rgba(30, 90, 110, 0.4)', glowColor: 'rgba(35, 100, 120, 0.1)', glowBlur: 30, strandCount: 14, strandSpacing: 18, phaseOffset: 0.5 },
    { baseYRatio: 0.55, amplitude: 220, frequency: 0.0005, speedFactor: -0.45, loopCycles: 1, harmonics: 5, noiseDisplace: 55, noiseScale: 1.1, lineWidth: 0.7, opacity: 0.16, color: 'rgba(28, 85, 105, 0.35)', glowColor: 'rgba(30, 90, 110, 0.08)', glowBlur: 28, strandCount: 12, strandSpacing: 20, phaseOffset: 2.1 },
    // ── Primary teal highlight waves ──
    { baseYRatio: 0.46, amplitude: 150, frequency: 0.0009, speedFactor: 0.75, loopCycles: 1, harmonics: 6, noiseDisplace: 40, noiseScale: 1.5, lineWidth: 0.9, opacity: 0.3, color: 'rgba(43, 118, 142, 0.5)', glowColor: 'rgba(43, 118, 142, 0.15)', glowBlur: 22, strandCount: 10, strandSpacing: 12, phaseOffset: 0.8 },
    { baseYRatio: 0.52, amplitude: 130, frequency: 0.001, speedFactor: -0.7, loopCycles: 1, harmonics: 5, noiseDisplace: 35, noiseScale: 1.4, lineWidth: 0.8, opacity: 0.25, color: 'rgba(40, 110, 135, 0.45)', glowColor: 'rgba(40, 110, 135, 0.12)', glowBlur: 20, strandCount: 8, strandSpacing: 14, phaseOffset: 1.6 },
    // ── Bright accent waves ──
    { baseYRatio: 0.49, amplitude: 100, frequency: 0.0013, speedFactor: 1.0, loopCycles: 2, harmonics: 4, noiseDisplace: 25, noiseScale: 2.0, lineWidth: 1.0, opacity: 0.35, color: 'rgba(65, 143, 168, 0.55)', glowColor: 'rgba(65, 143, 168, 0.2)', glowBlur: 15, strandCount: 6, strandSpacing: 9, phaseOffset: 0.3 },
    { baseYRatio: 0.51, amplitude: 80, frequency: 0.0016, speedFactor: -1.1, loopCycles: 2, harmonics: 3, noiseDisplace: 20, noiseScale: 2.2, lineWidth: 1.1, opacity: 0.3, color: 'rgba(70, 150, 175, 0.5)', glowColor: 'rgba(70, 150, 175, 0.18)', glowBlur: 12, strandCount: 5, strandSpacing: 10, phaseOffset: 2.5 },
    // ── Ultra-bright thin highlights ──
    { baseYRatio: 0.47, amplitude: 60, frequency: 0.002, speedFactor: 1.3, loopCycles: 3, harmonics: 3, noiseDisplace: 15, noiseScale: 2.5, lineWidth: 1.2, opacity: 0.25, color: 'rgba(80, 170, 195, 0.5)', glowColor: 'rgba(80, 170, 195, 0.2)', glowBlur: 10, strandCount: 3, strandSpacing: 7, phaseOffset: 1.0 },
    { baseYRatio: 0.53, amplitude: 50, frequency: 0.0025, speedFactor: -1.4, loopCycles: 3, harmonics: 2, noiseDisplace: 12, noiseScale: 2.8, lineWidth: 1.0, opacity: 0.2, color: 'rgba(90, 180, 205, 0.45)', glowColor: 'rgba(90, 180, 205, 0.15)', glowBlur: 8, strandCount: 3, strandSpacing: 6, phaseOffset: 3.0 },
    // ── Upper & lower subtle waves ──
    { baseYRatio: 0.25, amplitude: 120, frequency: 0.0005, speedFactor: -0.35, loopCycles: 1, harmonics: 4, noiseDisplace: 45, noiseScale: 0.9, lineWidth: 0.4, opacity: 0.1, color: 'rgba(25, 70, 85, 0.3)', glowColor: 'rgba(25, 70, 85, 0.04)', glowBlur: 35, strandCount: 6, strandSpacing: 25, phaseOffset: 4.0 },
    { baseYRatio: 0.75, amplitude: 140, frequency: 0.0004, speedFactor: 0.3, loopCycles: 1, harmonics: 4, noiseDisplace: 50, noiseScale: 0.85, lineWidth: 0.4, opacity: 0.1, color: 'rgba(22, 65, 80, 0.28)', glowColor: 'rgba(22, 65, 80, 0.04)', glowBlur: 38, strandCount: 5, strandSpacing: 28, phaseOffset: 5.2 },
];

// ─── Particle system ───────────────────────────────────────────────────────
interface Particle {
    xRatio: number;
    yRatio: number;
    size: number;
    baseOpacity: number;
    speedX: number;
    speedY: number;
    phase: number;
    trailLength: number;
    hue: number; // 170-200 range for teal variations
}

const PARTICLE_COUNT = 200;

function generateParticles(): Particle[] {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const s1 = Math.sin(i * 43758.5453) * 0.5 + 0.5;
        const s2 = Math.cos(i * 12.9898 + 7.0) * 0.5 + 0.5;
        const s3 = Math.sin(i * 98.412 + 3.0) * 0.5 + 0.5;
        const s4 = Math.cos(i * 56.789) * 0.5 + 0.5;
        particles.push({
            xRatio: s1,
            yRatio: s2,
            size: s3 * 2.5 + 0.3,
            baseOpacity: s1 * 0.25 + 0.03,
            speedX: (s3 - 0.5) * 0.08,
            speedY: (s4 - 0.5) * 0.12,
            phase: s2 * Math.PI * 2,
            trailLength: Math.floor(s1 * 6) + 2,
            hue: 170 + s3 * 30,
        });
    }
    return particles;
}

// ─── Wave function with noise displacement ─────────────────────────────────
function waveY(
    x: number,
    baseY: number,
    amplitude: number,
    frequency: number,
    phase: number,
    harmonics: number,
    noiseDisplace: number,
    noiseScale: number,
    noisePhase: number,
): number {
    let y = 0;
    // Harmonic sine stack
    for (let h = 1; h <= harmonics; h++) {
        y += Math.sin(x * frequency * h + phase * h) * (amplitude / h);
    }
    // Noise displacement for organic feel
    const nx = x * 0.001 * noiseScale;
    const ny = noisePhase * 2.0;
    const noise = (fbm(nx, ny, 3) - 0.5) * 2 * noiseDisplace;
    return baseY + y + noise;
}

// ─── Caustic interference pattern ──────────────────────────────────────────
function caustic(x: number, y: number, t: number): number {
    const v1 = Math.sin(x * 0.003 + t * 0.7) * Math.cos(y * 0.004 + t * 0.5);
    const v2 = Math.sin(x * 0.005 - t * 0.4 + 1.3) * Math.cos(y * 0.003 + t * 0.8 + 0.7);
    const v3 = Math.sin((x + y) * 0.002 + t * 0.6 + 2.1);
    return (v1 + v2 + v3) / 3;
}

// ─── Main component ────────────────────────────────────────────────────────
export const DarkWaves: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const progress = frame / durationInFrames;
    const particles = useMemo(() => generateParticles(), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const t = progress; // 0..1
        const TAU = Math.PI * 2;

        // ════════════════════════════════════════════════════════════════════
        // 1. BACKGROUND — near-black with slowly morphing noise clouds
        // ════════════════════════════════════════════════════════════════════
        ctx.fillStyle = '#060f14';
        ctx.fillRect(0, 0, width, height);

        // Morphing noise cloud field
        const cloudStep = 12; // pixel step for perf
        for (let cy = 0; cy < height; cy += cloudStep) {
            for (let cx = 0; cx < width; cx += cloudStep) {
                const n = loopNoise(cx * 0.0008, cy * 0.0008, t, 3.0);
                const brightness = n * 0.06; // very subtle
                if (brightness > 0.02) {
                    const r = Math.floor(6 + brightness * 30);
                    const g = Math.floor(15 + brightness * 50);
                    const b = Math.floor(20 + brightness * 60);
                    ctx.fillStyle = `rgba(${r},${g},${b},0.4)`;
                    ctx.fillRect(cx, cy, cloudStep, cloudStep);
                }
            }
        }

        // Radial vignette
        const vig = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.72);
        vig.addColorStop(0, 'rgba(10, 25, 32, 0.25)');
        vig.addColorStop(0.4, 'rgba(8, 20, 26, 0.12)');
        vig.addColorStop(1, 'rgba(3, 8, 11, 0)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, width, height);

        // ════════════════════════════════════════════════════════════════════
        // 2. CAUSTIC LIGHT INTERFERENCE PATTERN
        // ════════════════════════════════════════════════════════════════════
        const causticStep = 16;
        for (let cy = 0; cy < height; cy += causticStep) {
            for (let cx = 0; cx < width; cx += causticStep) {
                const c = caustic(cx, cy, t * TAU);
                if (c > 0.3) {
                    const intensity = (c - 0.3) * 0.15;
                    ctx.fillStyle = `rgba(43, 118, 142, ${intensity})`;
                    ctx.fillRect(cx, cy, causticStep, causticStep);
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // 3. MESH GRID DISTORTION OVERLAY
        // ════════════════════════════════════════════════════════════════════
        const gridSpacing = 80;
        ctx.save();
        ctx.globalAlpha = 0.04;
        ctx.strokeStyle = 'rgba(43, 118, 142, 0.5)';
        ctx.lineWidth = 0.5;

        // Horizontal grid lines
        for (let gy = 0; gy < height; gy += gridSpacing) {
            ctx.beginPath();
            for (let gx = 0; gx <= width; gx += 8) {
                const distort = fbm(gx * 0.002, gy * 0.002 + t * 2, 3) * 30 - 15;
                const distortY = fbm(gx * 0.003 + 100, gy * 0.003 + t * 1.5, 2) * 20 - 10;
                if (gx === 0) ctx.moveTo(gx, gy + distort + distortY);
                else ctx.lineTo(gx, gy + distort + distortY);
            }
            ctx.stroke();
        }

        // Vertical grid lines
        for (let gx = 0; gx < width; gx += gridSpacing) {
            ctx.beginPath();
            for (let gy = 0; gy <= height; gy += 8) {
                const distort = fbm(gx * 0.002 + 50, gy * 0.002 + t * 2, 3) * 30 - 15;
                const distortX = fbm(gx * 0.003 + 200, gy * 0.003 + t * 1.5, 2) * 20 - 10;
                if (gy === 0) ctx.moveTo(gx + distort + distortX, gy);
                else ctx.lineTo(gx + distort + distortX, gy);
            }
            ctx.stroke();
        }
        ctx.restore();

        // ════════════════════════════════════════════════════════════════════
        // 4. WAVE LAYERS — complex ribbon waves
        // ════════════════════════════════════════════════════════════════════
        for (const layer of WAVE_LAYERS) {
            const phase = t * TAU * layer.loopCycles * layer.speedFactor + layer.phaseOffset;
            const baseY = height * layer.baseYRatio;
            const noisePhase = t * layer.loopCycles + layer.phaseOffset;

            // Glow pass (wide blurred stroke)
            if (layer.glowBlur > 0) {
                ctx.save();
                ctx.filter = `blur(${layer.glowBlur}px)`;
                ctx.globalAlpha = layer.opacity * 0.5;
                ctx.strokeStyle = layer.glowColor;
                ctx.lineWidth = layer.lineWidth * 10;
                ctx.lineCap = 'round';
                ctx.beginPath();
                for (let x = -30; x <= width + 30; x += 6) {
                    const y = waveY(x, baseY, layer.amplitude, layer.frequency, phase, layer.harmonics, layer.noiseDisplace, layer.noiseScale, noisePhase);
                    if (x === -30) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.restore();
            }

            // Strand passes
            for (let s = 0; s < layer.strandCount; s++) {
                const offset = (s - layer.strandCount / 2) * layer.strandSpacing;
                const centerDist = Math.abs(s - layer.strandCount / 2) / (layer.strandCount / 2);
                const strandOpacity = layer.opacity * (1 - centerDist * 0.7);

                ctx.save();
                ctx.globalAlpha = strandOpacity;
                ctx.strokeStyle = layer.color;
                ctx.lineWidth = layer.lineWidth * (1 - centerDist * 0.3);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();

                for (let x = -30; x <= width + 30; x += 3) {
                    const ampMod = layer.amplitude * (0.7 + 0.3 * Math.sin(s * 0.7 + phase * 0.3));
                    const y = waveY(x, baseY + offset, ampMod, layer.frequency, phase + s * 0.25, layer.harmonics, layer.noiseDisplace * 0.8, layer.noiseScale, noisePhase + s * 0.1);
                    if (x === -30) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.restore();
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // 5. PARTICLE FIELD WITH TRAILS
        // ════════════════════════════════════════════════════════════════════
        for (const p of particles) {
            // Seamless position: use modular arithmetic
            const rawX = (p.xRatio + t * p.speedX) % 1;
            const rawY = (p.yRatio + t * p.speedY) % 1;
            const px = ((rawX % 1) + 1) % 1 * width;
            const py = ((rawY % 1) + 1) % 1 * height;

            const flicker = 0.6 + 0.4 * Math.sin(frame * 0.08 + p.phase);
            const opacity = p.baseOpacity * flicker;

            // Trail
            if (p.trailLength > 1) {
                ctx.save();
                ctx.globalAlpha = opacity * 0.3;
                ctx.strokeStyle = `hsla(${p.hue}, 60%, 50%, 0.3)`;
                ctx.lineWidth = p.size * 0.5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(px, py);
                for (let ti = 1; ti <= p.trailLength; ti++) {
                    const trailProgress = ((t - ti * 0.003) % 1 + 1) % 1;
                    const tx = ((p.xRatio + trailProgress * p.speedX) % 1 + 1) % 1 * width;
                    const ty = ((p.yRatio + trailProgress * p.speedY) % 1 + 1) % 1 * height;
                    ctx.lineTo(tx, ty);
                }
                ctx.stroke();
                ctx.restore();
            }

            // Particle dot
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = `hsla(${p.hue}, 65%, 55%, 0.9)`;
            ctx.shadowColor = `hsla(${p.hue}, 70%, 50%, 0.5)`;
            ctx.shadowBlur = p.size * 4;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // ════════════════════════════════════════════════════════════════════
        // 6. HORIZONTAL LIGHT STREAKS WITH SHIMMER
        // ════════════════════════════════════════════════════════════════════
        for (let i = 0; i < 8; i++) {
            const streakY = height * (0.2 + i * 0.08);
            const streakPhase = t * TAU + i * 1.1;
            const shimmer = 0.02 + 0.015 * Math.sin(streakPhase) + 0.01 * Math.sin(streakPhase * 2.3 + i);
            const streakWidth = 20 + 15 * Math.sin(streakPhase * 0.7 + i * 0.5);

            ctx.save();
            ctx.globalAlpha = shimmer;
            const grad = ctx.createLinearGradient(0, streakY - streakWidth, 0, streakY + streakWidth);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.3, 'rgba(43, 118, 142, 0.15)');
            grad.addColorStop(0.5, 'rgba(65, 143, 168, 0.25)');
            grad.addColorStop(0.7, 'rgba(43, 118, 142, 0.15)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, streakY - streakWidth, width, streakWidth * 2);
            ctx.restore();
        }

        // ════════════════════════════════════════════════════════════════════
        // 7. AMBIENT GLOW HOTSPOTS (slowly drifting)
        // ════════════════════════════════════════════════════════════════════
        const hotspots = [
            { xRatio: 0.3, yRatio: 0.4, radius: 400, hue: 190 },
            { xRatio: 0.7, yRatio: 0.55, radius: 350, hue: 185 },
            { xRatio: 0.5, yRatio: 0.35, radius: 500, hue: 195 },
            { xRatio: 0.2, yRatio: 0.6, radius: 300, hue: 180 },
            { xRatio: 0.8, yRatio: 0.45, radius: 320, hue: 192 },
        ];

        for (const hs of hotspots) {
            const hx = (hs.xRatio + Math.sin(t * TAU + hs.hue) * 0.05) * width;
            const hy = (hs.yRatio + Math.cos(t * TAU * 0.7 + hs.hue) * 0.03) * height;
            const pulse = 0.03 + 0.02 * Math.sin(t * TAU * 2 + hs.hue);

            ctx.save();
            ctx.globalAlpha = pulse;
            const hsGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hs.radius);
            hsGrad.addColorStop(0, `hsla(${hs.hue}, 50%, 40%, 0.15)`);
            hsGrad.addColorStop(0.5, `hsla(${hs.hue}, 45%, 30%, 0.06)`);
            hsGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = hsGrad;
            ctx.fillRect(hx - hs.radius, hy - hs.radius, hs.radius * 2, hs.radius * 2);
            ctx.restore();
        }

        // ════════════════════════════════════════════════════════════════════
        // 8. FINAL VIGNETTE OVERLAY
        // ════════════════════════════════════════════════════════════════════
        const finalVig = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.25, width * 0.5, height * 0.5, width * 0.75);
        finalVig.addColorStop(0, 'rgba(0,0,0,0)');
        finalVig.addColorStop(0.6, 'rgba(0,0,0,0.1)');
        finalVig.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = finalVig;
        ctx.fillRect(0, 0, width, height);

    }, [frame, width, height, durationInFrames, progress, particles]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#060f14',
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

export default DarkWaves;
