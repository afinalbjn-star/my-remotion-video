import { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const LiquidMetal: React.FC = () => {
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
        const seed = 42;
        let s = seed;
        const rng = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
        for (let i = 0; i < 256; i++) {
            const angle = rng() * Math.PI * 2;
            gradX[i] = Math.cos(angle);
            gradY[i] = Math.sin(angle);
        }
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            const tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp;
        }
        for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
        const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
        const dot = (gi: number, x: number, y: number) => gradX[gi] * x + gradY[gi] * y;
        const lerp = (a: number, b: number, t: number) => a + t * (b - a);
        const noise2D = (x: number, y: number) => {
            const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
            const xf = x - Math.floor(x), yf = y - Math.floor(y);
            const u = fade(xf), v = fade(yf);
            const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1];
            const ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
            return lerp(lerp(dot(aa, xf, yf), dot(ba, xf - 1, yf), u), lerp(dot(ab, xf, yf - 1), dot(bb, xf - 1, yf - 1), u), v);
        };
        const fbm = (x: number, y: number, octaves = 4) => {
            let val = 0, amp = 0.5, freq = 1;
            for (let i = 0; i < octaves; i++) { val += amp * noise2D(x * freq, y * freq); amp *= 0.5; freq *= 2; }
            return val;
        };

        const loopT = (frame / durationInFrames) * Math.PI * 2;
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Metaball positions — flowing mercury blobs
        const blobs: { x: number; y: number; r: number }[] = [];
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + loopT;
            const cx = width / 2 + Math.cos(angle + loopT * (0.3 + i * 0.1)) * (width * 0.28);
            const cy = height / 2 + Math.sin(angle * 1.3 + loopT * (0.2 + i * 0.08)) * (height * 0.22);
            const r = 80 + 50 * Math.sin(loopT + i);
            blobs.push({ x: cx, y: cy, r });
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Metaball field
                let field = 0;
                for (const b of blobs) {
                    const dx = x - b.x, dy = y - b.y;
                    field += (b.r * b.r) / (dx * dx + dy * dy + 1);
                }

                // Surface distortion with noise
                const nx = x / 300, ny = y / 300;
                const distort = fbm(nx + loopT * 0.3, ny + loopT * 0.2, 4) * 0.5;
                field += distort;

                // Metal surface
                const threshold = 1.0;
                const edge = 0.15;

                if (field > threshold - edge) {
                    const surface = Math.min(1, (field - threshold + edge) / edge);

                    // Metallic gradient based on surface normal
                    const dxN = fbm((x + 1) / 200 + loopT * 0.2, y / 200) - fbm((x - 1) / 200 + loopT * 0.2, y / 200);
                    const dyN = fbm(x / 200, (y + 1) / 200 + loopT * 0.2) - fbm(x / 200, (y - 1) / 200 + loopT * 0.2);
                    const normal = Math.sqrt(dxN * dxN + dyN * dyN + 1);
                    const nz = 1 / normal;

                    // Light direction — sweeping
                    const lightAngle = loopT * 0.5;
                    const lx = Math.cos(lightAngle) * 0.5;
                    const ly = Math.sin(lightAngle) * 0.3 - 0.7;
                    const lz = 0.8;
                    const dotL = Math.max(0, (dxN * lx + dyN * ly + nz * lz) / normal);

                    // Fresnel
                    const viewDot = Math.max(0, nz);
                    const fresnel = Math.pow(1 - viewDot, 3);

                    // Specular
                    const halfX = lx, halfY = ly, halfZ = lz + 1;
                    const halfLen = Math.sqrt(halfX * halfX + halfY * halfY + halfZ * halfZ);
                    const specDot = Math.max(0, (dxN * halfX + dyN * halfY + nz * halfZ) / (normal * halfLen));
                    const specular = Math.pow(specDot, 80);

                    // Gold-silver metallic blend
                    const goldR = 255, goldG = 215, goldB = 100;
                    const silverR = 220, silverG = 225, silverB = 235;
                    const blend = 0.5 + 0.5 * Math.sin(loopT * 0.3 + x * 0.005);
                    const baseR = lerp(silverR, goldR, blend);
                    const baseG = lerp(silverG, goldG, blend);
                    const baseB = lerp(silverB, goldB, blend);

                    // Final color
                    const ambient = 0.15;
                    const diffuse = dotL * 0.6;
                    const r = Math.min(255, baseR * (ambient + diffuse) + specular * 255 + fresnel * 80);
                    const g = Math.min(255, baseG * (ambient + diffuse) + specular * 240 + fresnel * 60);
                    const b = Math.min(255, baseB * (ambient + diffuse) + specular * 200 + fresnel * 40);

                    data[idx] = r * surface + 8 * (1 - surface);
                    data[idx + 1] = g * surface + 5 * (1 - surface);
                    data[idx + 2] = b * surface + 10 * (1 - surface);
                    data[idx + 3] = 255;
                } else {
                    // Black reflective surface with subtle caustics
                    const caustic = Math.max(0, fbm(x / 150 + loopT * 0.4, y / 150 - loopT * 0.3, 3)) * 15;
                    data[idx] = 5 + caustic * 0.7;
                    data[idx + 1] = 3 + caustic * 0.5;
                    data[idx + 2] = 8 + caustic * 0.3;
                    data[idx + 3] = 255;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Glow overlay
        ctx.globalCompositeOperation = 'screen';
        const grd = ctx.createRadialGradient(width * 0.5, height * 0.4, 0, width * 0.5, height * 0.4, width * 0.5);
        grd.addColorStop(0, 'rgba(255, 215, 100, 0.08)');
        grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
    });

    return <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%', display: 'block' }} />;
};
