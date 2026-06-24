import { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const StarField: React.FC = () => {
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
        let s = 17;
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

        // Warp speed — stars fly toward camera from center
        const centerX = width / 2, centerY = height / 2;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const nx = x / width, ny = y / height;

                // Deep space with subtle nebula
                const nebula = fbm(nx * 3 + loopT * 0.03, ny * 3 - loopT * 0.02, 4);
                let r = 2 + Math.max(0, nebula) * 15;
                let g = 1 + Math.max(0, nebula) * 8;
                let b = 5 + Math.max(0, nebula) * 25;

                // Static stars layer
                const starHash1 = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
                const starVal1 = starHash1 - Math.floor(starHash1);
                if (starVal1 > 0.995) {
                    const twinkle = 0.5 + 0.5 * Math.sin(loopT * 3 + starVal1 * 100);
                    const brightness = twinkle * 180;
                    r += brightness; g += brightness; b += brightness * 1.1;
                }

                // Warp streaks — radial lines from center
                const dx = x - centerX, dy = y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                for (let i = 0; i < 60; i++) {
                    const starAngle = (i / 60) * Math.PI * 2 + loopT * 0.1;
                    const starDist = ((i * 137.5 + loopT * 0.5 * (1 + (i % 3) * 0.3)) % 1);
                    const starR = starDist * Math.min(width, height) * 0.6;

                    const angleDiff = Math.abs(((angle - starAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
                    const arcLen = Math.max(1, starR * 0.02);

                    if (angleDiff < 0.02 && Math.abs(dist - starR) < arcLen) {
                        const streak = (1 - angleDiff / 0.02) * (1 - Math.abs(dist - starR) / arcLen);
                        const speed = 0.5 + (i % 5) * 0.1;
                        const brightness = streak * speed * 200;
                        // Blue-white streaks
                        r += brightness * 0.7;
                        g += brightness * 0.8;
                        b += brightness;
                    }
                }

                // Central glow
                const centerGlow = Math.max(0, 1 - dist / (Math.min(width, height) * 0.3));
                r += centerGlow * 30;
                g += centerGlow * 25;
                b += centerGlow * 50;

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
