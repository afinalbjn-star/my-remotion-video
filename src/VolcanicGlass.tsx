import { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const VolcanicGlass: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const perm = new Uint8Array(512);
        const gradX = new Float32Array(256);
        const gradY = new Float32Array(256);
        let s = 44;
        const rng = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
        for (let i = 0; i < 256; i++) { const a = rng() * Math.PI * 2; gradX[i] = Math.cos(a); gradY[i] = Math.sin(a); }
        for (let i = 255; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
        for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
        const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
        const lerp = (a: number, b: number, t: number) => a + t * (b - a);
        const dot = (gi: number, x: number, y: number) => gradX[gi] * x + gradY[gi] * y;
        const noise2D = (x: number, y: number) => {
            const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
            const xf = x - Math.floor(x), yf = y - Math.floor(y);
            const u = fade(xf), v = fade(yf);
            const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1], ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
            return lerp(lerp(dot(aa, xf, yf), dot(ba, xf - 1, yf), u), lerp(dot(ab, xf, yf - 1), dot(bb, xf - 1, yf - 1), u), v);
        };
        const fbm = (x: number, y: number, oct = 5) => {
            let v = 0, a = 0.5, f = 1;
            for (let i = 0; i < oct; i++) { v += a * noise2D(x * f, y * f); a *= 0.5; f *= 2; }
            return v;
        };

        const loopT = (frame / durationInFrames) * Math.PI * 2;
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const nx = x / width, ny = y / height;

                // Obsidian base — dark glossy surface
                const surface = fbm(nx * 6, ny * 6, 4);
                let r = 8 + surface * 15;
                let g = 5 + surface * 10;
                let b = 12 + surface * 20;

                // Cracks with glowing lava
                const crack1 = fbm(nx * 12 + loopT * 0.05, ny * 12, 4);
                const crack2 = fbm(nx * 8 - loopT * 0.03, ny * 8 + loopT * 0.04, 3);
                const crackPattern = Math.abs(crack1) + Math.abs(crack2) * 0.5;

                if (crackPattern < 0.15) {
                    const crackIntensity = (1 - crackPattern / 0.15);
                    const pulse = 0.7 + 0.3 * Math.sin(loopT * 1.5 + nx * 10 + ny * 8);
                    const heat = crackIntensity * pulse;

                    // Lava glow — orange to white hot
                    const heatT = heat;
                    r += lerp(200, 255, heatT) * heat;
                    g += lerp(80, 200, heatT) * heat;
                    b += lerp(20, 120, heatT) * heat * 0.5;
                }

                // Flowing lava rivers
                for (let river = 0; river < 3; river++) {
                    const riverY = 0.3 + river * 0.2;
                    const riverWave = fbm(nx * 4 + loopT * 0.1 + river * 3, riverY, 3) * 0.08;
                    const riverDist = Math.abs(ny - riverY - riverWave);

                    if (riverDist < 0.03) {
                        const riverIntensity = (1 - riverDist / 0.03);
                        const flow = fbm(nx * 8 + loopT * 0.3, ny * 2, 3);
                        const brightness = riverIntensity * (0.5 + flow * 0.5);

                        r += 255 * brightness * 0.6;
                        g += 120 * brightness * 0.6;
                        b += 30 * brightness * 0.3;
                    }
                }

                // Specular highlights on obsidian
                const specX = 0.5 + Math.sin(loopT * 0.4) * 0.2;
                const specY = 0.3 + Math.cos(loopT * 0.3) * 0.1;
                const specDist = Math.sqrt((nx - specX) ** 2 + (ny - specY) ** 2);
                if (specDist < 0.2) {
                    const specIntensity = Math.pow(1 - specDist / 0.2, 4) * 0.3;
                    r += 100 * specIntensity;
                    g += 80 * specIntensity;
                    b += 120 * specIntensity;
                }

                // Floating embers
                for (let e = 0; e < 15; e++) {
                    const ex = ((e * 137.5 + loopT * 0.02) % 1) * width;
                    const ey = height - ((loopT * 0.05 + e * 0.1) % 1.2) * height;
                    const edist = Math.sqrt((x - ex) ** 2 + (y - ey) ** 2);
                    if (edist < 15) {
                        const emberGlow = (1 - edist / 15) * 0.8;
                        r += 255 * emberGlow;
                        g += 150 * emberGlow;
                        b += 30 * emberGlow;
                    }
                }

                // Heat shimmer distortion effect
                const shimmer = fbm(nx * 10 + loopT * 0.5, ny * 10, 3) * 0.02;
                r += shimmer * 100;
                g += shimmer * 50;

                data[idx] = Math.min(255, Math.max(0, r));
                data[idx + 1] = Math.min(255, Math.max(0, g));
                data[idx + 2] = Math.min(255, Math.max(0, b));
                data[idx + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    });

    return <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%', display: 'block' }} />;
};
