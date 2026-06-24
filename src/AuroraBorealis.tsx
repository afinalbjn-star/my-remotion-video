import { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const AuroraBorealis: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Perlin noise
        const perm = new Uint8Array(512);
        const gradX = new Float32Array(256);
        const gradY = new Float32Array(256);
        let s = 73;
        const rng = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
        for (let i = 0; i < 256; i++) {
            const a = rng() * Math.PI * 2;
            gradX[i] = Math.cos(a); gradY[i] = Math.sin(a);
        }
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
            for (let i = 0; i < oct; i++) { v += a * noise2D(x * f, y * f); a *= 0.5; f *= 2.1; }
            return v;
        };

        const loopT = (frame / durationInFrames) * Math.PI * 2;
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const nx = x / width, ny = y / height;

                // Night sky base
                const skyGrad = Math.max(0, 1 - ny * 1.2);
                let r = 3 + skyGrad * 8;
                let g = 2 + skyGrad * 5;
                let b = 15 + skyGrad * 20;

                // Stars
                const starHash = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
                const starVal = starHash - Math.floor(starHash);
                if (starVal > 0.997 && ny < 0.6) {
                    const twinkle = 0.5 + 0.5 * Math.sin(loopT * 3 + starVal * 100);
                    const brightness = twinkle * 200;
                    r += brightness; g += brightness; b += brightness * 1.2;
                }

                // Mountain silhouette
                const mountainH = 0.75 + fbm(nx * 5, 0.5, 3) * 0.15;
                if (ny > mountainH) {
                    const depth = (ny - mountainH) / (1 - mountainH);
                    r = 5 + depth * 3; g = 4 + depth * 2; b = 10 + depth * 5;
                } else {
                    // Aurora bands — 5 curtains
                    for (let band = 0; band < 5; band++) {
                        const bandCenter = 0.2 + band * 0.08;
                        const waveOffset = fbm(nx * 3 + loopT * 0.15 + band * 2, loopT * 0.1 + band, 4) * 0.08;
                        const curtainX = fbm(nx * 8 + loopT * 0.2, band * 3 + loopT * 0.05, 3) * 0.03;

                        const dist = Math.abs(ny - bandCenter - waveOffset - curtainX);
                        const intensity = Math.max(0, 1 - dist / 0.06) * (0.4 + 0.6 * Math.abs(noise2D(nx * 10 + loopT * 0.3, band)));

                        // Curtain vertical rays
                        const ray = Math.max(0, Math.sin(nx * 60 + fbm(nx * 5 + loopT * 0.1, band, 3) * 10));
                        const curtain = intensity * (0.3 + 0.7 * ray);

                        if (curtain > 0.01) {
                            // Aurora colors: green, teal, purple, pink
                            const colors = [
                                [50, 255, 100],   // green
                                [30, 200, 180],   // teal
                                [150, 80, 255],   // purple
                                [255, 60, 180],   // pink
                                [100, 255, 200],  // cyan-green
                            ];
                            const c = colors[band];
                            const shimmer = 0.6 + 0.4 * Math.sin(loopT * 2 + nx * 20 + band);
                            r += c[0] * curtain * shimmer;
                            g += c[1] * curtain * shimmer;
                            b += c[2] * curtain * shimmer;
                        }
                    }

                    // Glow on horizon
                    const horizonGlow = Math.max(0, 1 - ny / 0.3) * 15;
                    r += horizonGlow * 0.3;
                    g += horizonGlow * 0.5;
                    b += horizonGlow * 0.8;
                }

                data[idx] = Math.min(255, r);
                data[idx + 1] = Math.min(255, g);
                data[idx + 2] = Math.min(255, b);
                data[idx + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Soft glow overlay
        ctx.globalCompositeOperation = 'screen';
        const grd = ctx.createRadialGradient(width * 0.5, height * 0.25, 0, width * 0.5, height * 0.25, width * 0.4);
        grd.addColorStop(0, 'rgba(50, 255, 120, 0.06)');
        grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
    });

    return <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%', display: 'block' }} />;
};
