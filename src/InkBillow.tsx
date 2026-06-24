import React, { useRef, useEffect } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

// ==========================================
// INK BILLOW v2 — Premium Slow-Motion Billowing Ink
// Full-screen, dense, seamless loop, 4K 60fps 10s
// ==========================================

function seededPRNG(a: number) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Improved Perlin-style noise
function createNoise(seed: number) {
    const rng = seededPRNG(seed);
    const perm = new Uint8Array(512);
    const gradX = new Float32Array(256);
    const gradY = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
        perm[i] = i;
        const angle = rng() * Math.PI * 2;
        gradX[i] = Math.cos(angle);
        gradY[i] = Math.sin(angle);
    }
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

    function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function dot(gi: number, x: number, y: number) { return gradX[gi] * x + gradY[gi] * y; }

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
        const x1 = lerp(dot(aa, xf, yf), dot(ba, xf - 1, yf), u);
        const x2 = lerp(dot(ab, xf, yf - 1), dot(bb, xf - 1, yf - 1), u);
        return lerp(x1, x2, v);
    };
}

function lerp(a: number, b: number, t: number) { return a + t * (b - a); }

function fbm(noise: ReturnType<typeof createNoise>, x: number, y: number, octaves: number = 6): number {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;
    let maxVal = 0;
    for (let i = 0; i < octaves; i++) {
        value += amplitude * noise(x * frequency, y * frequency);
        maxVal += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value / maxVal;
}

// Domain warping for extra organic feel
function warpedNoise(
    n1: ReturnType<typeof createNoise>,
    n2: ReturnType<typeof createNoise>,
    x: number, y: number, time: number
): number {
    const qx = fbm(n1, x + time * 0.1, y, 4);
    const qy = fbm(n1, x, y + time * 0.1, 4);
    return fbm(n2, x + 4.0 * qx, y + 4.0 * qy, 4);
}

// ==========================================
// CONFIGURATION — Premium dense ink
// ==========================================
const CONFIG = {
    blobs: {
        count: 28,           // Much more blobs for full coverage
        maxRadius: 1100,     // Bigger blobs to fill screen
        minRadius: 350,
    },
    // Premium deep ink colors — high saturation, deep tones
    colors: [
        { r: 180, g: 10, b: 50 },     // Deep crimson
        { r: 10, g: 40, b: 160 },     // Deep sapphire
        { r: 140, g: 10, b: 140 },    // Rich magenta
        { r: 10, g: 100, b: 80 },     // Deep emerald
        { r: 180, g: 80, b: 10 },     // Burnt amber
        { r: 30, g: 10, b: 110 },     // Deep indigo
        { r: 160, g: 30, b: 30 },     // Blood red
        { r: 10, g: 120, b: 160 },    // Deep teal
        { r: 100, g: 20, b: 160 },    // Royal purple
        { r: 10, g: 80, b: 50 },      // Forest green
        { r: 180, g: 60, b: 20 },     // Deep orange
        { r: 60, g: 10, b: 120 },     // Dark violet
        { r: 120, g: 10, b: 60 },     // Wine
        { r: 10, g: 60, b: 100 },     // Navy
        { r: 100, g: 40, b: 10 },     // Umber
        { r: 20, g: 100, b: 100 },    // Dark cyan
        { r: 140, g: 20, b: 80 },     // Crimson purple
        { r: 40, g: 20, b: 80 },      // Midnight
        { r: 80, g: 10, b: 40 },      // Dark maroon
        { r: 10, g: 80, b: 120 },     // Deep ocean
        { r: 120, g: 60, b: 10 },     // Bronze
        { r: 20, g: 40, b: 80 },      // Dark steel
        { r: 100, g: 10, b: 100 },    // Plum
        { r: 10, g: 60, b: 40 },      // Dark jade
        { r: 140, g: 40, b: 20 },     // Rust
        { r: 30, g: 20, b: 60 },      // Dark slate
        { r: 80, g: 20, b: 60 },      // Mauve
        { r: 20, g: 80, b: 60 },      // Dark sage
    ],
    noise: {
        scale: 0.002,
        distortion: 180,
        speed: 0.3,
    },
    background: '#050508',
};

// ==========================================
// INK BLOB DATA
// ==========================================
interface InkBlob {
    cx: number;
    cy: number;
    baseRadius: number;
    color: typeof CONFIG.colors[0];
    noiseOffsetX: number;
    noiseOffsetY: number;
    phaseOffset: number;
    layers: number;
    wobbleFreq: number;
    wobbleAmp: number;
    driftX: number;       // Slow drift direction
    driftY: number;
    layerSpread: number;  // How much layers spread outward
}

function createBlobs(width: number, height: number): InkBlob[] {
    const rng = seededPRNG(42);
    const blobs: InkBlob[] = [];
    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < CONFIG.blobs.count; i++) {
        const angle = (i / CONFIG.blobs.count) * Math.PI * 2 + rng() * 0.8;
        // Spread blobs across entire screen — some near center, some at edges
        const distFromCenter = 50 + rng() * Math.max(width, height) * 0.45;
        blobs.push({
            cx: cx + Math.cos(angle) * distFromCenter,
            cy: cy + Math.sin(angle) * distFromCenter,
            baseRadius: CONFIG.blobs.minRadius + rng() * (CONFIG.blobs.maxRadius - CONFIG.blobs.minRadius),
            color: CONFIG.colors[i % CONFIG.colors.length],
            noiseOffsetX: rng() * 1000,
            noiseOffsetY: rng() * 1000,
            phaseOffset: rng() * Math.PI * 2,
            layers: 4 + Math.floor(rng() * 4),
            wobbleFreq: 0.3 + rng() * 1.2,
            wobbleAmp: 0.2 + rng() * 0.35,
            driftX: (rng() - 0.5) * 0.6,
            driftY: (rng() - 0.5) * 0.6,
            layerSpread: 0.3 + rng() * 0.5,
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

    const noise1 = createNoise(12345);
    const noise2 = createNoise(67890);
    const noise3 = createNoise(11111);

    const blobs = React.useMemo(() => createBlobs(width, height), [width, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Seamless loop: 0 → 2π
        const progress = frame / durationInFrames;
        const time = progress * Math.PI * 2;

        // Fill background
        ctx.fillStyle = CONFIG.background;
        ctx.fillRect(0, 0, width, height);

        // Draw each ink blob — back to front
        for (const blob of blobs) {
            // Seamless expand/contract cycle
            const expandPhase = (Math.sin(time + blob.phaseOffset) + 1) / 2;
            const currentRadius = blob.baseRadius * (0.55 + expandPhase * 0.55);

            // Slow drift (seamless: sin/cos based)
            const driftAmount = 40;
            const driftOffsetX = Math.sin(time * 0.5 + blob.phaseOffset) * driftAmount * blob.driftX;
            const driftOffsetY = Math.cos(time * 0.5 + blob.phaseOffset * 1.3) * driftAmount * blob.driftY;
            const blobCx = blob.cx + driftOffsetX;
            const blobCy = blob.cy + driftOffsetY;

            // Draw multiple concentric layers for depth
            for (let layer = blob.layers - 1; layer >= 0; layer--) {
                const layerRatio = layer / blob.layers;
                const layerRadius = currentRadius * (0.3 + layerRatio * (0.7 + blob.layerSpread));
                // Denser alpha — more opaque ink
                const layerAlpha = 0.12 + layerRatio * 0.28;

                ctx.beginPath();

                const segments = 160; // High quality for 4K
                for (let s = 0; s <= segments; s++) {
                    const angle = (s / segments) * Math.PI * 2;

                    // Multi-scale noise distortion
                    const noiseX = Math.cos(angle) * CONFIG.noise.scale * layerRadius;
                    const noiseY = Math.sin(angle) * CONFIG.noise.scale * layerRadius;

                    // Domain-warped noise for ultra-organic edges
                    const n1 = warpedNoise(
                        noise1, noise2,
                        noiseX + blob.noiseOffsetX,
                        noiseY + blob.noiseOffsetY,
                        time * CONFIG.noise.speed + blob.phaseOffset
                    );

                    // Secondary noise layer
                    const n2 = fbm(noise3,
                        noiseX * 2.0 + blob.noiseOffsetX + 200,
                        noiseY * 2.0 + blob.noiseOffsetY + 200 + time * CONFIG.noise.speed * 0.3,
                        3
                    );

                    // Slow wobble — billowing effect
                    const wobble = Math.sin(
                        angle * blob.wobbleFreq * 4 + time * 0.6 + blob.phaseOffset
                    ) * blob.wobbleAmp;

                    // Secondary wobble for complexity
                    const wobble2 = Math.sin(
                        angle * blob.wobbleFreq * 7 + time * 0.4 + blob.phaseOffset * 2
                    ) * blob.wobbleAmp * 0.3;

                    // Combine all distortions
                    const distortion = (n1 * 0.5 + n2 * 0.2 + wobble + wobble2)
                        * CONFIG.noise.distortion
                        * (layerRatio + 0.4);

                    const r = layerRadius + distortion;

                    const px = blobCx + Math.cos(angle) * r;
                    const py = blobCy + Math.sin(angle) * r;

                    if (s === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();

                // Rich radial gradient — dense center, soft edges
                const gradient = ctx.createRadialGradient(
                    blobCx, blobCy, 0,
                    blobCx, blobCy, layerRadius * 1.3
                );

                const { r, g, b } = blob.color;
                // Core: very dense
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${layerAlpha * 2.0})`);
                // Inner: saturated
                gradient.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, ${layerAlpha * 1.5})`);
                // Mid: main body
                gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${layerAlpha})`);
                // Outer: soft fade
                gradient.addColorStop(0.75, `rgba(${r}, ${g}, ${b}, ${layerAlpha * 0.4})`);
                // Edge: transparent
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }

        // === POST-PROCESSING ===

        // Subtle vignette — cinematic framing
        const vignetteGrad = ctx.createRadialGradient(
            width / 2, height / 2, width * 0.25,
            width / 2, height / 2, width * 0.75
        );
        vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
        vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, width, height);

        // Premium light bloom — subtle glow
        const bloomGrad = ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, width * 0.4
        );
        const bloomPulse = 0.04 + Math.sin(time) * 0.02;
        bloomGrad.addColorStop(0, `rgba(255, 255, 255, ${bloomPulse})`);
        bloomGrad.addColorStop(0.3, `rgba(200, 180, 255, ${bloomPulse * 0.4})`);
        bloomGrad.addColorStop(0.6, `rgba(150, 120, 200, ${bloomPulse * 0.15})`);
        bloomGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bloomGrad;
        ctx.fillRect(0, 0, width, height);

        // Very subtle color temperature shift — warm highlights
        const warmGrad = ctx.createRadialGradient(
            width * 0.35, height * 0.35, 0,
            width * 0.5, height * 0.5, width * 0.6
        );
        const warmPulse = 0.015 + Math.sin(time * 0.7) * 0.008;
        warmGrad.addColorStop(0, `rgba(255, 200, 150, ${warmPulse})`);
        warmGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = warmGrad;
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
