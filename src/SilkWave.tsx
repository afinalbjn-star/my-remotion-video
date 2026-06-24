import React, { useRef, useEffect } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

// ==========================================
// SILKWAVE — Flowing Silk Fabric Seamless Loop
// 4K 60fps 10s — Premium silk cloth blowing in wind
// with translucency, light scattering, soft folds
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
        const tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp;
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

// Domain warping for organic silk folds
function warpedNoise(
    n1: ReturnType<typeof createNoise>,
    n2: ReturnType<typeof createNoise>,
    n3: ReturnType<typeof createNoise>,
    x: number, y: number, time: number
): number {
    const q1x = fbm(n1, x + time * 0.06, y + time * 0.02, 4);
    const q1y = fbm(n1, x - time * 0.02, y + time * 0.06, 4);
    const q2x = fbm(n2, x + 3.0 * q1x + time * 0.04, y + 3.0 * q1y, 4);
    const q2y = fbm(n2, x + 3.0 * q1x, y + 3.0 * q1y + time * 0.04, 4);
    return fbm(n3, x + 3.0 * q2x, y + 3.0 * q2y, 5);
}

// ==========================================
// CONFIGURATION — Premium silk fabric
// ==========================================
const CONFIG = {
    // Silk color palette — Rose, Ivory, Champagne
    baseColors: [
        { r: 230, g: 180, b: 190 },  // Rose
        { r: 255, g: 245, b: 235 },  // Ivory
        { r: 245, g: 220, b: 190 },  // Champagne
        { r: 220, g: 170, b: 180 },  // Dusty Rose
        { r: 250, g: 235, b: 220 },  // Warm Ivory
    ],
    // Fold highlight colors
    highlightColors: [
        { r: 255, g: 250, b: 248 },  // Pure white highlight
        { r: 255, g: 230, b: 235 },  // Rose highlight
        { r: 255, g: 245, b: 230 },  // Champagne highlight
    ],
    // Shadow colors for depth
    shadowColors: [
        { r: 160, g: 100, b: 120 },  // Rose shadow
        { r: 180, g: 140, b: 130 },  // Warm shadow
        { r: 140, g: 90, b: 110 },   // Deep rose shadow
    ],
    // Background — dark to make silk pop
    background: { r: 15, g: 10, b: 18 },
    // Fold parameters
    folds: {
        count: 8,
        amplitude: 0.35,
        frequency: 1.2,
    },
    // Light source position (normalized 0-1)
    lightX: 0.3,
    lightY: 0.2,
    lightIntensity: 1.4,
};

// ==========================================
// CANVAS RENDERER
// ==========================================
const SilkWave: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frame = useCurrentFrame();
    const { width, height, fps, durationInFrames } = useVideoConfig();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Create noise generators
        const n1 = createNoise(42);
        const n2 = createNoise(137);
        const n3 = createNoise(256);
        const n4 = createNoise(389);

        // Seamless loop time
        const loopDuration = durationInFrames;
        const t = (frame / loopDuration) * Math.PI * 2; // 0 → 2π

        // Pre-compute sin/cos for loop
        const sinT = Math.sin(t);
        const cosT = Math.cos(t);

        // Wind parameters — smooth looping
        const windX = sinT * 0.15;
        const windY = cosT * 0.08;

        // Render at half resolution for performance, then upscale
        const renderW = Math.floor(width / 2);
        const renderH = Math.floor(height / 2);
        const offCanvas = document.createElement('canvas');
        offCanvas.width = renderW;
        offCanvas.height = renderH;
        const offCtx = offCanvas.getContext('2d')!;
        const offData = offCtx.createImageData(renderW, renderH);
        const offPixels = offData.data;

        for (let py = 0; py < renderH; py++) {
            for (let px = 0; px < renderW; px++) {
                const nx = px / renderW;
                const ny = py / renderH;

                // === SILK FOLD GEOMETRY ===
                // Multiple wave layers for fabric folds
                let foldDisplace = 0;
                for (let f = 0; f < CONFIG.folds.count; f++) {
                    const freq = CONFIG.folds.frequency * (1 + f * 0.4);
                    const amp = CONFIG.folds.amplitude / (1 + f * 0.3);
                    const phase = f * 1.7 + windX * (1 + f * 0.5);
                    foldDisplace += Math.sin(nx * freq * Math.PI * 2 + phase + sinT * 0.3) * amp;
                    foldDisplace += Math.cos(ny * freq * 1.3 * Math.PI * 2 + phase * 0.7 + cosT * 0.2) * amp * 0.6;
                }

                // Domain-warped displacement for organic feel
                const warpX = warpedNoise(n1, n2, n3, nx * 3.0, ny * 3.0, sinT * 0.5) * 0.4;
                const warpY = warpedNoise(n2, n3, n4, nx * 3.0 + 5, ny * 3.0 + 5, cosT * 0.5) * 0.4;

                // Combined displacement
                const dx = nx + warpX + windX * 0.3 + foldDisplace * 0.15;
                const dy = ny + warpY + windY * 0.3 + foldDisplace * 0.1;

                // === SILK SURFACE NORMAL (for lighting) ===
                // Compute gradient for fold normal
                const eps = 0.003;
                const foldL = Math.sin((nx - eps) * CONFIG.folds.frequency * Math.PI * 2 + sinT * 0.3) * CONFIG.folds.amplitude;
                const foldR = Math.sin((nx + eps) * CONFIG.folds.frequency * Math.PI * 2 + sinT * 0.3) * CONFIG.folds.amplitude;
                const foldU = Math.cos((ny - eps) * CONFIG.folds.frequency * 1.3 * Math.PI * 2 + cosT * 0.2) * CONFIG.folds.amplitude * 0.6;
                const foldD = Math.cos((ny + eps) * CONFIG.folds.frequency * 1.3 * Math.PI * 2 + cosT * 0.2) * CONFIG.folds.amplitude * 0.6;

                const normalX = (foldR - foldL) / (2 * eps);
                const normalY = (foldD - foldU) / (2 * eps);
                const normalZ = 1.0;
                const normalLen = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
                const nnx = normalX / normalLen;
                const nny = normalY / normalLen;
                const nnz = normalZ / normalLen;

                // Light direction
                const lx = CONFIG.lightX - nx;
                const ly = CONFIG.lightY - ny;
                const lz = 0.8;
                const lLen = Math.sqrt(lx * lx + ly * ly + lz * lz);
                const ldx = lx / lLen;
                const ldy = ly / lLen;
                const ldz = lz / lLen;

                // Diffuse lighting
                const diffuse = Math.max(0, nnx * ldx + nny * ldy + nnz * ldz);

                // Specular (silk sheen — broad, soft)
                const halfX = ldx;
                const halfY = ldy;
                const halfZ = ldz + 1.0;
                const hLen = Math.sqrt(halfX * halfX + halfY * halfY + halfZ * halfZ);
                const spec = Math.pow(Math.max(0, (nnx * halfX + nny * halfY + nnz * halfZ) / hLen), 12);

                // Fresnel-like rim (silk edge glow)
                const viewDot = nnz;
                const fresnel = Math.pow(1 - viewDot, 3) * 0.5;

                // === SILK COLOR ===
                // Base color from noise
                const colorNoise = fbm(n4, dx * 2.5, dy * 2.5, 4);
                const colorIdx = Math.floor(((colorNoise + 1) / 2) * CONFIG.baseColors.length) % CONFIG.baseColors.length;
                const nextIdx = (colorIdx + 1) % CONFIG.baseColors.length;
                const colorT = ((colorNoise + 1) / 2) * CONFIG.baseColors.length - colorIdx;

                const base = CONFIG.baseColors[colorIdx];
                const next = CONFIG.baseColors[nextIdx];
                let r = lerp(base.r, next.r, colorT);
                let g = lerp(base.g, next.g, colorT);
                let b = lerp(base.b, next.b, colorT);

                // === FOLD SHADING ===
                // Darken in valleys, brighten on peaks
                const foldVal = foldDisplace / CONFIG.folds.amplitude;
                const shadowMix = Math.max(0, -foldVal) * 0.6;
                const highlightMix = Math.max(0, foldVal) * 0.4;

                // Apply shadow
                if (shadowMix > 0) {
                    const shadow = CONFIG.shadowColors[colorIdx % CONFIG.shadowColors.length];
                    r = lerp(r, shadow.r, shadowMix);
                    g = lerp(g, shadow.g, shadowMix);
                    b = lerp(b, shadow.b, shadowMix);
                }

                // Apply highlight on peaks
                if (highlightMix > 0) {
                    const hl = CONFIG.highlightColors[colorIdx % CONFIG.highlightColors.length];
                    r = lerp(r, hl.r, highlightMix);
                    g = lerp(g, hl.g, highlightMix);
                    b = lerp(b, hl.b, highlightMix);
                }

                // === LIGHTING ===
                // Diffuse
                const diffuseLight = diffuse * CONFIG.lightIntensity;
                r *= (0.5 + diffuseLight * 0.5);
                g *= (0.5 + diffuseLight * 0.5);
                b *= (0.5 + diffuseLight * 0.5);

                // Specular sheen (silk's signature)
                const specBright = spec * 0.7;
                r = r + (255 - r) * specBright;
                g = g + (255 - g) * specBright;
                b = b + (255 - b) * specBright;

                // Fresnel rim glow
                r += fresnel * 40;
                g += fresnel * 35;
                b += fresnel * 30;

                // === TRANSLUCENCY ===
                // Light passing through thin silk areas
                const thinness = Math.abs(foldVal) * 0.3;
                const transColor = CONFIG.baseColors[(colorIdx + 2) % CONFIG.baseColors.length];
                r = lerp(r, transColor.r + 30, thinness * 0.3);
                g = lerp(g, transColor.g + 20, thinness * 0.3);
                b = lerp(b, transColor.b + 15, thinness * 0.3);

                // === SUBSURFACE SCATTERING ===
                // Warm glow where light passes through
                const sss = Math.max(0, diffuse - 0.3) * 0.15;
                r += sss * 50;
                g += sss * 25;
                b += sss * 15;

                // === EDGE VIGNETTE ===
                const edgeDist = Math.min(nx, 1 - nx, ny, 1 - ny);
                const vignette = Math.min(1, edgeDist * 4);
                r *= vignette;
                g *= vignette;
                b *= vignette;

                // Clamp
                r = Math.max(0, Math.min(255, r));
                g = Math.max(0, Math.min(255, g));
                b = Math.max(0, Math.min(255, b));

                // Write pixel
                const idx = (py * renderW + px) * 4;
                offPixels[idx] = r;
                offPixels[idx + 1] = g;
                offPixels[idx + 2] = b;
                offPixels[idx + 3] = 255;
            }
        }

        offCtx.putImageData(offData, 0, 0);

        // Upscale to full resolution with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(offCanvas, 0, 0, width, height);

    }, [frame, width, height, fps, durationInFrames]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#0f0a12' }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ width: '100%', height: '100%' }}
            />
        </AbsoluteFill>
    );
};

export default SilkWave;
