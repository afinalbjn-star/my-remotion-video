import { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const MysticForest: React.FC = () => {
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
        let s = 61;
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

        // Fireflies — 40 particles
        const fireflies: { x: number; y: number; phase: number; brightness: number }[] = [];
        for (let i = 0; i < 40; i++) {
            const baseX = (i * 0.025 + Math.sin(loopT * 0.3 + i * 1.7) * 0.03) % 1;
            const baseY = 0.3 + (i % 5) * 0.12 + Math.cos(loopT * 0.2 + i * 2.1) * 0.02;
            fireflies.push({ x: baseX, y: baseY, phase: i * 0.8, brightness: 0.5 + (i % 3) * 0.25 });
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const nx = x / width, ny = y / height;

                // Dark forest base
                const fogGrad = Math.max(0, 1 - ny * 1.5);
                let r = 3 + fogGrad * 8;
                let g = 5 + fogGrad * 12;
                let b = 4 + fogGrad * 8;

                // Fog layers
                for (let layer = 0; layer < 3; layer++) {
                    const fog = fbm(nx * 3 + loopT * 0.05 + layer * 5, ny * 2 + loopT * 0.03, 3);
                    const fogIntensity = Math.max(0, fog) * (0.3 + layer * 0.1) * fogGrad;
                    r += fogIntensity * 20;
                    g += fogIntensity * 35;
                    b += fogIntensity * 25;
                }

                // Tree trunks — procedural
                for (let t = 0; t < 8; t++) {
                    const treeX = (t / 8 + 0.06) * width;
                    const trunkW = 15 + (t % 3) * 8;
                    const sway = Math.sin(loopT * 0.5 + t) * 3;
                    const dx = Math.abs(x - treeX - sway);

                    if (dx < trunkW && ny > 0.2) {
                        const trunkFade = Math.min(1, dx / trunkW);
                        const bark = fbm(x * 0.05, y * 0.02, 3) * 0.3;
                        r = lerp(r, 15 + bark * 20, 1 - trunkFade);
                        g = lerp(g, 10 + bark * 15, 1 - trunkFade);
                        b = lerp(b, 8 + bark * 10, 1 - trunkFade);
                    }

                    // Canopy
                    if (ny < 0.45) {
                        const canopyY = 0.1 + (t % 3) * 0.05;
                        const canopyR = 0.12 + (t % 2) * 0.04;
                        const canopyX = (t / 8 + 0.06) + Math.sin(loopT * 0.3 + t) * 0.01;
                        const cdist = Math.sqrt((nx - canopyX) ** 2 + (ny - canopyY) ** 2);
                        if (cdist < canopyR) {
                            const leafNoise = fbm(nx * 20 + loopT * 0.1, ny * 20, 3);
                            const leafDensity = (1 - cdist / canopyR) * (0.5 + leafNoise * 0.5);
                            r = lerp(r, 10 + leafNoise * 20, leafDensity);
                            g = lerp(g, 30 + leafNoise * 40, leafDensity);
                            b = lerp(b, 10 + leafNoise * 15, leafDensity);
                        }
                    }
                }

                // Ground with moss
                if (ny > 0.8) {
                    const groundNoise = fbm(nx * 8, ny * 4, 3);
                    const groundFade = (ny - 0.8) / 0.2;
                    r = lerp(r, 8 + groundNoise * 15, groundFade);
                    g = lerp(g, 15 + groundNoise * 25, groundFade);
                    b = lerp(b, 6 + groundNoise * 10, groundFade);
                }

                // Fireflies
                for (const ff of fireflies) {
                    const fx = ff.x * width, fy = ff.y * height;
                    const fdist = Math.sqrt((x - fx) ** 2 + (y - fy) ** 2);
                    if (fdist < 40) {
                        const pulse = 0.3 + 0.7 * Math.max(0, Math.sin(loopT * 2 + ff.phase));
                        const glow = (1 - fdist / 40) * pulse * ff.brightness;
                        r += 180 * glow;
                        g += 255 * glow;
                        b += 80 * glow;
                    }
                }

                // God rays from top
                for (let ray = 0; ray < 3; ray++) {
                    const rayX = 0.2 + ray * 0.3 + Math.sin(loopT * 0.2 + ray) * 0.05;
                    const rayWidth = 0.05 + Math.sin(loopT * 0.5 + ray * 2) * 0.02;
                    const rayDist = Math.abs(nx - rayX);
                    if (rayDist < rayWidth && ny < 0.6) {
                        const rayIntensity = (1 - rayDist / rayWidth) * (1 - ny / 0.6) * 0.15;
                        r += 60 * rayIntensity;
                        g += 80 * rayIntensity;
                        b += 40 * rayIntensity;
                    }
                }

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
