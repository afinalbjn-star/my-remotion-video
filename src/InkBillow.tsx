import React, { useRef, useEffect } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

// ==========================================
// INK BILLOW v3 — Ultra-Dense Premium Ink
// Full-screen, maximum saturation, cinematic motion, seamless loop
// ==========================================

function seededPRNG(a: number) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

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

// Double domain warping — ultra-organic distortion
function warpedNoise(
    n1: ReturnType<typeof createNoise>,
    n2: ReturnType<typeof createNoise>,
    n3: ReturnType<typeof createNoise>,
    x: number, y: number, time: number
): number {
    // First warp
    const q1x = fbm(n1, x + time * 0.08, y + time * 0.03, 4);
    const q1y = fbm(n1, x - time * 0.03, y + time * 0.08, 4);
    // Second warp
    const q2x = fbm(n2, x + 4.0 * q1x + time * 0.05, y + 4.0 * q1y, 4);
    const q2y = fbm(n2, x + 4.0 * q1x, y + 4.0 * q1y + time * 0.05, 4);
    return fbm(n3, x + 4.0 * q2x, y + 4.0 * q2y, 5);
}

// ==========================================
// CONFIGURATION — Ultra-dense premium ink
// ==========================================
const CONFIG = {
    blobs: {
        count: 35,
        maxRadius: 1300,
        minRadius: 400,
    },
    // MAXIMUM SATURATION — vivid, deep, rich ink colors
    colors: [
        { r: 220, g: 5, b: 40 },      // Vivid crimson
        { r: 5, g: 30, b: 200 },       // Vivid sapphire
        { r: 180, g: 5, b: 180 },      // Vivid magenta
        { r: 5, g: 140, b: 90 },       // Vivid emerald
        { r: 220, g: 100, b: 5 },      // Vivid amber
        { r: 40, g: 5, b: 160 },       // Vivid indigo
        { r: 200, g: 20, b: 20 },      // Vivid blood
        { r: 5, g: 160, b: 200 },      // Vivid teal
        { r: 130, g: 10, b: 200 },     // Vivid purple
        { r: 5, g: 120, b: 60 },       // Vivid forest
        { r: 230, g: 80, b: 10 },      // Vivid orange
        { r: 80, g: 5, b: 160 },       // Vivid violet
        { r: 160, g: 5, b: 80 },       // Vivid wine
        { r: 5, g: 80, b: 140 },       // Vivid navy
        { r: 140, g: 50, b: 5 },       // Vivid umber
        { r: 5, g: 140, b: 140 },      // Vivid cyan
        { r: 180, g: 15, b: 100 },     // Vivid fuchsia
        { r: 50, g: 10, b: 120 },      // Vivid midnight
        { r: 100, g: 5, b: 50 },       // Vivid maroon
        { r: 5, g: 100, b: 160 },      // Vivid ocean
        { r: 160, g: 80, b: 5 },       // Vivid bronze
        { r: 10, g: 50, b: 120 },      // Vivid steel
        { r: 140, g: 5, b: 140 },      // Vivid plum
        { r: 5, g: 100, b: 60 },       // Vivid jade
        { r: 200, g: 50, b: 10 },      // Vivid rust
        { r: 40, g: 15, b: 100 },      // Vivid slate
        { r: 120, g: 10, b: 80 },      // Vivid mauve
        { r: 5, g: 120, b: 80 },       // Vivid sage
        { r: 180, g: 30, b: 60 },      // Vivid rose
        { r: 10, g: 60, b: 180 },      // Vivid cobalt
        { r: 160, g: 10, b: 120 },     // Vivid raspberry
        { r: 10, g: 160, b: 40 },      // Vivid lime-green
        { r: 200, g: 60, b: 30 },      // Vivid terracotta
        { r: 30, g: 10, b: 180 },      // Vivid ultramarine
        { r: 100, g: 5, b: 120 },      // Vivid grape
    ],
    noise: {
        scale: 0.0018,
        distortion: 220,
        speed: 0.25,
    },
    background: '#020205',
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
    driftX: number;
    driftY: number;
    layerSpread: number;
    rotationSpeed: number;   // Slow rotation for cinematic feel
    pulseFreq: number;       // Independent pulse rhythm
    pulseDepth: number;      // How much it pulses
}

function createBlobs(width: number, height: number): InkBlob[] {
    const rng = seededPRNG(42);
    const blobs: InkBlob[] = [];
    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < CONFIG.blobs.count; i++) {
        const angle = (i / CONFIG.blobs.count) * Math.PI * 2 + rng() * 0.6;
        const distFromCenter = rng() * Math.max(width, height) * 0.5;
        blobs.push({
            cx: cx + Math.cos(angle) * distFromCenter,
            cy: cy + Math.sin(angle) * distFromCenter,
            baseRadius: CONFIG.blobs.minRadius + rng() * (CONFIG.blobs.maxRadius - CONFIG.blobs.minRadius),
            color: CONFIG.colors[i % CONFIG.colors.length],
            noiseOffsetX: rng() * 1000,
            noiseOffsetY: rng() * 1000,
            phaseOffset: rng() * Math.PI * 2,
            layers: 5 + Math.floor(rng() * 4),
            wobbleFreq: 0.2 + rng() * 1.0,
            wobbleAmp: 0.25 + rng() * 0.4,
            driftX: (rng() - 0.5) * 0.8,
            driftY: (rng() - 0.5) * 0.8,
            layerSpread: 0.35 + rng() * 0.5,
            rotationSpeed: (rng() - 0.5) * 0.3,
            pulseFreq: 0.3 + rng() * 0.8,
            pulseDepth: 0.15 + rng() * 0.25,
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
    const noise4 = createNoise(22222);

    const blobs = React.useMemo(() => createBlobs(width, height), [width, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const progress = frame / durationInFrames;
        const time = progress * Math.PI * 2;

        // Fill background
        ctx.fillStyle = CONFIG.background;
        ctx.fillRect(0, 0, width, height);

        // Draw each ink blob
        for (const blob of blobs) {
            // Multi-rhythm expand/contract — more organic
            const expandBase = (Math.sin(time + blob.phaseOffset) + 1) / 2;
            const expandPulse = Math.sin(time * blob.pulseFreq + blob.phaseOffset * 1.7) * blob.pulseDepth;
            const expandPhase = Math.max(0, Math.min(1, expandBase + expandPulse));
            const currentRadius = blob.baseRadius * (0.5 + expandPhase * 0.6);

            // Cinematic drift — slow, sweeping motion
            const driftAmount = 60;
            const driftOffsetX = Math.sin(time * 0.4 + blob.phaseOffset) * driftAmount * blob.driftX
                + Math.sin(time * 0.15 + blob.phaseOffset * 2.3) * driftAmount * 0.3;
            const driftOffsetY = Math.cos(time * 0.4 + blob.phaseOffset * 1.3) * driftAmount * blob.driftY
                + Math.cos(time * 0.15 + blob.phaseOffset * 2.7) * driftAmount * 0.3;
            const blobCx = blob.cx + driftOffsetX;
            const blobCy = blob.cy + driftOffsetY;

            // Slow rotation offset for each layer
            const rotationOffset = time * blob.rotationSpeed;

            // Draw multiple concentric layers — ultra dense
            for (let layer = blob.layers - 1; layer >= 0; layer--) {
                const layerRatio = layer / blob.layers;
                const layerRadius = currentRadius * (0.25 + layerRatio * (0.75 + blob.layerSpread));
                // MAXIMUM alpha — very dense, saturated ink
                const layerAlpha = 0.2 + layerRatio * 0.45;

                ctx.beginPath();

                const segments = 180;
                for (let s = 0; s <= segments; s++) {
                    const angle = (s / segments) * Math.PI * 2;

                    const noiseX = Math.cos(angle) * CONFIG.noise.scale * layerRadius;
                    const noiseY = Math.sin(angle) * CONFIG.noise.scale * layerRadius;

                    // Triple domain-warped noise — ultra-organic
                    const n1 = warpedNoise(
                        noise1, noise2, noise3,
                        noiseX + blob.noiseOffsetX,
                        noiseY + blob.noiseOffsetY,
                        time * CONFIG.noise.speed + blob.phaseOffset + rotationOffset * 0.1
                    );

                    // Fine detail noise
                    const n2 = fbm(noise4,
                        noiseX * 3.0 + blob.noiseOffsetX + 300,
                        noiseY * 3.0 + blob.noiseOffsetY + 300 + time * CONFIG.noise.speed * 0.2,
                        4
                    );

                    // Multi-frequency wobble — cinematic billowing
                    const wobble1 = Math.sin(
                        angle * blob.wobbleFreq * 3 + time * 0.5 + blob.phaseOffset
                    ) * blob.wobbleAmp;
                    const wobble2 = Math.sin(
                        angle * blob.wobbleFreq * 7 + time * 0.35 + blob.phaseOffset * 2
                    ) * blob.wobbleAmp * 0.4;
                    const wobble3 = Math.sin(
                        angle * blob.wobbleFreq * 13 + time * 0.2 + blob.phaseOffset * 3
                    ) * blob.wobbleAmp * 0.15;

                    // Combine all distortions
                    const distortion = (n1 * 0.45 + n2 * 0.15 + wobble1 + wobble2 + wobble3)
                        * CONFIG.noise.distortion
                        * (layerRatio + 0.5);

                    const r = layerRadius + distortion;

                    const px = blobCx + Math.cos(angle + rotationOffset * layerRatio) * r;
                    const py = blobCy + Math.sin(angle + rotationOffset * layerRatio) * r;

                    if (s === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();

                // Ultra-rich radial gradient — maximum density
                const gradient = ctx.createRadialGradient(
                    blobCx, blobCy, 0,
                    blobCx, blobCy, layerRadius * 1.4
                );

                const { r, g, b } = blob.color;
                // Core: near-opaque
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${Math.min(1, layerAlpha * 2.5)})`);
                // Inner: very dense
                gradient.addColorStop(0.15, `rgba(${r}, ${g}, ${b}, ${layerAlpha * 2.0})`);
                // Mid-inner: saturated
                gradient.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${layerAlpha * 1.5})`);
                // Mid: main body
                gradient.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, ${layerAlpha})`);
                // Outer: soft fade
                gradient.addColorStop(0.75, `rgba(${r}, ${g}, ${b}, ${layerAlpha * 0.4})`);
                // Edge: transparent
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }

        // === POST-PROCESSING ===

        // Cinematic vignette
        const vignetteGrad = ctx.createRadialGradient(
            width / 2, height / 2, width * 0.2,
            width / 2, height / 2, width * 0.8
        );
        vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.1)');
        vignetteGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.35)');
        vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, width, height);

        // Premium bloom — breathing glow
        const bloomGrad = ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, width * 0.45
        );
        const bloomPulse = 0.05 + Math.sin(time) * 0.025 + Math.sin(time * 1.7) * 0.01;
        bloomGrad.addColorStop(0, `rgba(255, 255, 255, ${bloomPulse})`);
        bloomGrad.addColorStop(0.2, `rgba(220, 200, 255, ${bloomPulse * 0.5})`);
        bloomGrad.addColorStop(0.5, `rgba(180, 140, 220, ${bloomPulse * 0.2})`);
        bloomGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bloomGrad;
        ctx.fillRect(0, 0, width, height);

        // Color richness overlay — adds depth
        const richGrad = ctx.createRadialGradient(
            width * 0.4, height * 0.4, 0,
            width * 0.5, height * 0.5, width * 0.7
        );
        const richPulse = 0.02 + Math.sin(time * 0.6) * 0.01;
        richGrad.addColorStop(0, `rgba(255, 180, 120, ${richPulse})`);
        richGrad.addColorStop(0.5, `rgba(120, 80, 200, ${richPulse * 0.5})`);
        richGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = richGrad;
        ctx.fillRect(0, 0, width, height);

        // Subtle edge darkening for depth
        const edgeGrad = ctx.createLinearGradient(0, 0, 0, height);
        edgeGrad.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
        edgeGrad.addColorStop(0.1, 'rgba(0, 0, 0, 0)');
        edgeGrad.addColorStop(0.9, 'rgba(0, 0, 0, 0)');
        edgeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
        ctx.fillStyle = edgeGrad;
        ctx.fillRect(0, 0, width, height);

    }, [frame, width, height, durationInFrames, blobs, noise1, noise2, noise3, noise4]);

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
