import { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const PlasmaWave: React.FC = () => {
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
        let s = 33;
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

                // Plasma field — multiple interference patterns
                const v1 = Math.sin(nx * 12 + loopT * 0.8 + fbm(nx * 2, ny * 2 + loopT * 0.1, 3) * 2);
                const v2 = Math.sin(ny * 10 - loopT * 0.6 + fbm(nx * 2 + loopT * 0.1, ny * 2, 3) * 2);
                const v3 = Math.sin((nx + ny) * 8 + loopT * 0.5);
                const v4 = Math.sin(Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 15 - loopT);
                const v5 = fbm(nx * 4 + loopT * 0.15, ny * 4 - loopT * 0.1, 4);

                const plasma = (v1 + v2 + v3 + v4) * 0.25 + v5 * 0.3;

                // Map plasma to electric colors
                const t = (plasma + 1) * 0.5; // 0..1

                // Electric blue → cyan → white → magenta → deep blue
                let r, g, b;
                if (t < 0.25) {
                    const s = t / 0.25;
                    r = lerp(0, 20, s);
                    g = lerp(10, 80, s);
                    b = lerp(80, 255, s);
                } else if (t < 0.5) {
                    const s = (t - 0.25) / 0.25;
                    r = lerp(20, 100, s);
                    g = lerp(80, 255, s);
                    b = lerp(255, 255, s);
                } else if (t < 0.75) {
                    const s = (t - 0.5) / 0.25;
                    r = lerp(100, 255, s);
                    g = lerp(255, 200, s);
                    b = lerp(255, 255, s);
                } else {
                    const s = (t - 0.75) / 0.25;
                    r = lerp(255, 180, s);
                    g = lerp(200, 50, s);
                    b = lerp(255, 255, s);
                }

                // Energy pulse rings
                const dist = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2);
                const ring = Math.sin(dist * 30 - loopT * 2) * 0.5 + 0.5;
                const ringGlow = Math.max(0, 1 - dist * 2) * ring * 0.3;
                r += ringGlow * 200;
                g += ringGlow * 220;
                b += ringGlow * 255;

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
