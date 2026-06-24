import { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const DeepOcean: React.FC = () => {
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
        let s = 88;
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

        // Jellyfish positions — 6 jellyfish
        const jellies: { x: number; y: number; size: number; hue: number }[] = [];
        for (let i = 0; i < 6; i++) {
            const baseX = 0.15 + (i / 6) * 0.7;
            const driftX = Math.sin(loopT * 0.3 + i * 2) * 0.05;
            const driftY = Math.cos(loopT * 0.2 + i * 1.5) * 0.03;
            jellies.push({
                x: baseX + driftX,
                y: 0.3 + (i % 3) * 0.2 + driftY,
                size: 40 + (i % 3) * 20,
                hue: [180, 280, 200, 320, 160, 240][i],
            });
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const nx = x / width, ny = y / height;

                // Deep ocean gradient
                const depth = ny;
                let r = lerp(5, 2, depth);
                let g = lerp(20, 8, depth);
                let b = lerp(60, 20, depth);

                // Caustic light from above
                if (ny < 0.4) {
                    const caustic = fbm(nx * 8 + loopT * 0.2, ny * 8 + loopT * 0.15, 4);
                    const intensity = Math.max(0, caustic) * (1 - ny / 0.4) * 40;
                    r += intensity * 0.3;
                    g += intensity * 0.6;
                    b += intensity;
                }

                // Floating particles — plankton
                for (let p = 0; p < 30; p++) {
                    const px = ((p * 137.5 + loopT * 0.01 * (1 + p % 3)) % 1) * width;
                    const py = ((p * 91.3 + Math.sin(loopT * 0.1 + p) * 0.02) % 1) * height;
                    const pdist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
                    if (pdist < 8) {
                        const glow = (1 - pdist / 8) * 0.4;
                        r += 40 * glow; g += 120 * glow; b += 180 * glow;
                    }
                }

                // Jellyfish
                for (const jelly of jellies) {
                    const jx = jelly.x * width, jy = jelly.y * height;
                    const dx = x - jx, dy = y - jy;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < jelly.size * 2) {
                        // Bell
                        const bellDist = Math.sqrt(dx * dx + (dy + jelly.size * 0.3) ** 2);
                        if (bellDist < jelly.size) {
                            const bellIntensity = (1 - bellDist / jelly.size);
                            const pulse = 0.7 + 0.3 * Math.sin(loopT * 2 + jelly.hue);
                            const hueRad = jelly.hue * Math.PI / 180;
                            const cr = (Math.max(0, Math.cos(hueRad)) * 0.5 + 0.5);
                            const cg = (Math.max(0, Math.cos(hueRad - 2.094)) * 0.5 + 0.5);
                            const cb = (Math.max(0, Math.cos(hueRad - 4.189)) * 0.5 + 0.5);
                            r += cr * bellIntensity * pulse * 180;
                            g += cg * bellIntensity * pulse * 180;
                            b += cb * bellIntensity * pulse * 200;
                        }

                        // Tentacles
                        for (let t = 0; t < 5; t++) {
                            const tentX = jx + (t - 2) * jelly.size * 0.3;
                            const tentWave = Math.sin(loopT * 1.5 + t * 1.2 + ny * 8) * jelly.size * 0.2;
                            const tentDist = Math.abs(x - tentX - tentWave);
                            if (tentDist < 3 && dy > 0 && dy < jelly.size * 2) {
                                const fade = 1 - dy / (jelly.size * 2);
                                const hueRad = jelly.hue * Math.PI / 180;
                                r += Math.max(0, Math.cos(hueRad)) * fade * 100;
                                g += Math.max(0, Math.cos(hueRad - 2.094)) * fade * 100;
                                b += Math.max(0, Math.cos(hueRad - 4.189)) * fade * 120;
                            }
                        }
                    }
                }

                // Seabed with gentle terrain
                if (ny > 0.85) {
                    const terrain = fbm(nx * 6, 0.5, 3) * 0.1;
                    if (ny > 0.85 + terrain) {
                        const sandDepth = (ny - 0.85 - terrain) / 0.15;
                        r = lerp(r, 20, sandDepth);
                        g = lerp(g, 15, sandDepth);
                        b = lerp(b, 30, sandDepth);
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
