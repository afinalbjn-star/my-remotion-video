import React, { useRef, useEffect } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

// ==========================================
// INK BILLOW - Slow-Motion Billowing Ink Animation
// Seamless loop, 4K 60fps 10 seconds
// ==========================================

// Deterministic PRNG
function seededPRNG(a: number) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Simple 2D noise (value noise with smooth interpolation)
function createNoise(seed: number) {
    const rng = seededPRNG(seed);
    const perm = new Uint8Array(512);
    const grad = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
        perm[i] = i;
        grad[i] = rng() * 2 - 1;
    }
    // Fisher-Yates shuffle
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

    function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(a: number, b: number, t: number) { return a + t * (b - a); }

    return function noise2D(x: number, y: number): number {
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const u = fade(xf);
        const v = fade(yf);
        const aa = perm[perm[xi] + yi];
        const ab = perm[perm[xi] + yi + 1];
        const ba = perm[perm[xi + 1] + yi];
        const bb = perm[perm[xi + 1] + yi + 1];
        return lerp(
            lerp(grad[aa] * xf + grad[aa] * yf, grad[ba] * (xf - 1) + grad[ba] * yf, u),
            lerp(grad[ab] * xf + grad[ab] * (yf - 1), grad[bb] * (xf - 1) + grad[bb] * (yf - 1), u),
            v
        );
    };
}

// Fractal Brownian Motion
function fbm(noise: ReturnType<typeof createNoise>, x: number, y: number, octaves: number = 4): number {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;
    for (let i = 0; i < octaves; i++) {
        value += amplitude * noise(x * frequency, y * frequency);
        amplitude *= 0.5;
        frequency *= 2;
    }
    return value;
}

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
    // Ink blob configuration
    blobs: {
        count: 12,           // Number of ink blobs
        maxRadius: 800,      // Max radius in pixels (at 4K)
        minRadius: 200,      // Min radius
        expandSpeed: 0.3,    // How fast blobs expand (seamless: cycles over duration)
    },
    // Color palette - rich, saturated ink colors
    colors: [
        { r: 220, g: 40, b: 80, a: 0.6 },    // Deep red/crimson
        { r: 30, g: 80, b: 200, a: 0.55 },    // Royal blue
        { r: 180, g: 40, b: 180, a: 0.5 },    // Magenta/purple
        { r: 20, g: 160, b: 120, a: 0.5 },    // Teal/emerald
        { r: 240, g: 140, b: 30, a: 0.45 },   // Warm orange
        { r: 60, g: 20, b: 140, a: 0.5 },     // Deep indigo
        { r: 200, g: 60, b: 60, a: 0.45 },    // Burnt sienna
        { r: 40, g: 180, b: 200, a: 0.5 },    // Cyan
        { r: 160, g: 80, b: 200, a: 0.45 },   // Violet
        { r: 20, g: 120, b: 80, a: 0.5 },     // Forest green
        { r: 220, g: 100, b: 40, a: 0.45 },   // Amber
        { r: 100, g: 40, b: 160, a: 0.5 },    // Purple
    ],
    // Noise settings for organic distortion
    noise: {
        scale: 0.003,        // Base noise scale
        distortion: 120,     // Max pixel distortion
        speed: 0.4,          // Noise animation speed
    },
    // Background
    background: '#0a0a12',
};

// ==========================================
// INK BLOB DATA
// ==========================================
interface InkBlob {
    cx: number;          // Center X
    cy: number;          // Center Y
    baseRadius: number;  // Base radius
    color: typeof CONFIG.colors[0];
    noiseOffsetX: number;
    noiseOffsetY: number;
    phaseOffset: number; // Phase offset for seamless loop
    layers: number;      // Number of concentric layers
    wobbleFreq: number;  // Wobble frequency
    wobbleAmp: number;   // Wobble amplitude
}

function createBlobs(width: number, height: number): InkBlob[] {
    const rng = seededPRNG(42);
    const blobs: InkBlob[] = [];
    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < CONFIG.blobs.count; i++) {
        const angle = (i / CONFIG.blobs.count) * Math.PI * 2 + rng() * 0.5;
        const distFromCenter = 100 + rng() * 400;
        blobs.push({
            cx: cx + Math.cos(angle) * distFromCenter,
            cy: cy + Math.sin(angle) * distFromCenter,
            baseRadius: CONFIG.blobs.minRadius + rng() * (CONFIG.blobs.maxRadius - CONFIG.blobs.minRadius),
            color: CONFIG.colors[i % CONFIG.colors.length],
            noiseOffsetX: rng() * 1000,
            noiseOffsetY: rng() * 1000,
            phaseOffset: rng() * Math.PI * 2,
            layers: 3 + Math.floor(rng() * 3),
            wobbleFreq: 0.5 + rng() * 1.5,
            wobbleAmp: 0.15 + rng() * 0.25,
        });
    }
    return blobs;
}

// ==========================================
// MAIN COMPONENT
// ==========================================
const InkBillow: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Pre-compute noise functions
    const noise1 = createNoise(12345);
    const noise2 = createNoise(67890);
    const noise3 = createNoise(11111);

    // Create blobs once
    const blobs = React.useMemo(() => createBlobs(width, height), [width, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Seamless loop progress: 0 → 1 over duration, wraps smoothly
        const progress = frame / durationInFrames;
        const time = progress * Math.PI * 2; // Full cycle for seamless loop

        // Clear
        ctx.fillStyle = CONFIG.background;
        ctx.fillRect(0, 0, width, height);

        // Draw each ink blob
        for (const blob of blobs) {
            const expandProgress = (Math.sin(time + blob.phaseOffset) + 1) / 2; // 0 → 1 → 0 (seamless)
            const currentRadius = blob.baseRadius * (0.6 + expandProgress * 0.6);

            // Draw multiple layers for depth
            for (let layer = blob.layers - 1; layer >= 0; layer--) {
                const layerRatio = layer / blob.layers;
                const layerRadius = currentRadius * (0.4 + layerRatio * 0.8);
                const layerAlpha = blob.color.a * (0.15 + layerRatio * 0.35);

                // Create organic blob shape using noise-distorted circle
                ctx.beginPath();

                const segments = 120; // Smooth enough for 4K
                for (let s = 0; s <= segments; s++) {
                    const angle = (s / segments) * Math.PI * 2;

                    // Multi-octave noise distortion for organic edges
                    const noiseX = Math.cos(angle) * CONFIG.noise.scale * layerRadius;
                    const noiseY = Math.sin(angle) * CONFIG.noise.scale * layerRadius;

                    const n1 = fbm(noise1,
                        noiseX + blob.noiseOffsetX + Math.cos(time * CONFIG.noise.speed) * 2,
                        noiseY + blob.noiseOffsetY + Math.sin(time * CONFIG.noise.speed) * 2,
                        4
                    );
                    const n2 = fbm(noise2,
                        noiseX * 1.5 + blob.noiseOffsetX + 100,
                        noiseY * 1.5 + blob.noiseOffsetY + 100 + time * CONFIG.noise.speed * 0.5,
                        3
                    );

                    // Wobble for billowing effect
                    const wobble = Math.sin(angle * blob.wobbleFreq * 3 + time * 0.8 + blob.phaseOffset) * blob.wobbleAmp;

                    // Combine distortions
                    const distortion = (n1 * 0.7 + n2 * 0.3 + wobble) * CONFIG.noise.distortion * (layerRatio + 0.3);
                    const r = layerRadius + distortion;

                    const px = blob.cx + Math.cos(angle) * r;
                    const py = blob.cy + Math.sin(angle) * r;

                    if (s === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();

                // Radial gradient for soft edges
                const gradient = ctx.createRadialGradient(
                    blob.cx, blob.cy, 0,
                    blob.cx, blob.cy, layerRadius * 1.2
                );

                const { r, g, b } = blob.color;
                // Inner: more opaque and saturated
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${layerAlpha * 1.5})`);
                // Mid: main color
                gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${layerAlpha})`);
                // Outer: fade out
                gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${layerAlpha * 0.5})`);
                // Edge: transparent
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }

        // Add subtle vignette
        const vignetteGrad = ctx.createRadialGradient(
            width / 2, height / 2, width * 0.2,
            width / 2, height / 2, width * 0.7
        );
        vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, width, height);

        // Add subtle light bloom in center
        const bloomGrad = ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, width * 0.35
        );
        const bloomPulse = 0.03 + Math.sin(time) * 0.015;
        bloomGrad.addColorStop(0, `rgba(255, 255, 255, ${bloomPulse})`);
        bloomGrad.addColorStop(0.5, `rgba(200, 180, 255, ${bloomPulse * 0.3})`);
        bloomGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bloomGrad;
        ctx.fillRect(0, 0, width, height);

    }, [frame, width, height, durationInFrames, blobs, noise1, noise2, noise3]);

    return (
        <AbsoluteFill style={{ backgroundColor: CONFIG.background }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ width: '100%', height: '100%' }}
            />
        </AbsoluteFill>
    );
};

export default InkBillow;
