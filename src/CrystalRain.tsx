import { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const CrystalRain: React.FC = () => {
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
        let s = 55;
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
        const fbm = (x: number, y: number, oct = 4) => {
            let v = 0, a = 0.5, f = 1;
            for (let i = 0; i < oct; i++) { v += a * noise2D(x * f, y * f); a *= 0.5; f *= 2; }
            return v;
        };

        const loopT = (frame / durationInFrames) * Math.PI * 2;
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Crystal rain drops — 80 drops
        const drops: { x: number; speed: number; length: number; brightness: number; hue: number }[] = [];
        for (let i = 0; i < 80; i++) {
            const seed = i * 137.5;
            const baseX = ((seed * 1.1 + loopT * (0.02 + (i % 5) * 0.01)) % 1) * width;
            drops.push({
                x: baseX,
                speed: 0.08 + (i % 5) * 0.02,
                length: 30 + (i % 4) * 20,
                brightness: 0.5 + (i % 3) * 0.25,
                hue: (i * 47) % 360,
            });
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const nx = x / width, ny = y / height;

                // Deep blue-purple gradient background
                const bgGrad = ny;
                let r = lerp(10, 5, bgGrad) + fbm(nx * 3 + loopT * 0.05, ny * 3, 3) * 8;
                let g = lerp(5, 3, bgGrad) + fbm(nx * 3, ny * 3 + loopT * 0.05, 3) * 5;
                let b = lerp(40, 15, bgGrad) + fbm(nx * 3, ny * 3, 3) * 15;

                // Crystal drops
                for (const drop of drops) {
                    const dx = x - drop.x;
                    const dy = y - (frame / durationInFrames * height * 2 + drop.x * 0.3) % (height + drop.length);
                    if (dy > -drop.length && dy < 5) {
                        const along = 1 - (dy + drop.length) / (drop.length + 5);
                        const glow = Math.max(0, 1 - Math.abs(dx) / 3) * along * drop.brightness;
                        if (glow > 0.01) {
                            // Prismatic color
                            const hueRad = (drop.hue + along * 60) * Math.PI / 180;
                            const pr = Math.max(0, Math.cos(hueRad));
                            const pg = Math.max(0, Math.cos(hueRad - 2.094));
                            const pb = Math.max(0, Math.cos(hueRad - 4.189));
                            r += pr * glow * 255;
                            g += pg * glow * 255;
                            b += pb * glow * 255;
                        }
                    }
                }

                // Ambient floating particles
                for (let p = 0; p < 20; p++) {
                    const px = ((p * 173.7 + Math.sin(loopT * 0.3 + p) * 0.1) % 1) * width;
                    const py = ((p * 91.3 + loopT * 0.02 + Math.cos(loopT * 0.2 + p) * 0.05) % 1) * height;
                    const pdist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
                    if (pdist < 20) {
                        const glow = (1 - pdist / 20) * 0.3;
                        r += 100 * glow; g += 150 * glow; b += 255 * glow;
                    }
                }

                data[idx] = Math.min(255, r);
                data[idx + 1] = Math.min(255, g);
                data[idx + 2] = Math.min(255, b);
                data[idx + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    });

    return <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%', display: 'block' }} />;
};
