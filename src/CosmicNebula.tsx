import { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const CosmicNebula: React.FC = () => {
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
        let s = 99;
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
        const fbm = (x: number, y: number, oct = 6) => {
            let v = 0, a = 0.5, f = 1;
            for (let i = 0; i < oct; i++) { v += a * noise2D(x * f, y * f); a *= 0.5; f *= 2; }
            return v;
        };

        const loopT = (frame / durationInFrames) * Math.PI * 2;
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Nebula center drifts in a circle
        const cx = 0.5 + 0.08 * Math.cos(loopT * 0.7);
        const cy = 0.5 + 0.06 * Math.sin(loopT * 0.5);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const nx = x / width, ny = y / height;

                // Deep space base
                let r = 2, g = 1, b = 5;

                // Stars — dense field
                const starHash = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
                const starVal = starHash - Math.floor(starHash);
                if (starVal > 0.993) {
                    const twinkle = 0.5 + 0.5 * Math.sin(loopT * 2 + starVal * 200);
                    const brightness = twinkle * (150 + starVal * 100);
                    const temp = starVal;
                    r += brightness * (0.8 + temp * 0.2);
                    g += brightness * (0.85 + temp * 0.1);
                    b += brightness;
                }

                // Nebula clouds — multiple layers with domain warping
                for (let layer = 0; layer < 4; layer++) {
                    const scale = 1.5 + layer * 0.8;
                    const speed = 0.05 + layer * 0.02;

                    // Domain warping
                    const warpX = fbm(nx * scale + loopT * speed, ny * scale + layer * 5, 4) * 0.3;
                    const warpY = fbm(nx * scale + layer * 5 + 100, ny * scale + loopT * speed, 4) * 0.3;
                    const n = fbm((nx - cx) * scale + warpX + loopT * speed, (ny - cy) * scale + warpY, 5);

                    const density = Math.max(0, n * 0.8 + 0.2);
                    const falloff = 1 - Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2) * 1.2;
                    const cloud = density * Math.max(0, falloff);

                    if (cloud > 0.01) {
                        // Nebula colors per layer
                        const colors = [
                            [180, 40, 255],   // purple
                            [255, 50, 120],   // magenta-pink
                            [40, 100, 255],   // blue
                            [255, 120, 40],   // orange
                        ];
                        const c = colors[layer];
                        const shimmer = 0.7 + 0.3 * Math.sin(loopT * 1.5 + nx * 10 + layer * 2);
                        r += c[0] * cloud * shimmer * 0.4;
                        g += c[1] * cloud * shimmer * 0.4;
                        b += c[2] * cloud * shimmer * 0.4;
                    }
                }

                // Bright core
                const coreDist = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);
                const core = Math.max(0, 1 - coreDist / 0.15);
                r += core * 120;
                g += core * 100;
                b += core * 160;

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
