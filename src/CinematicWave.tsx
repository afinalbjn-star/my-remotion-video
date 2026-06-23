import React, { useEffect, useMemo, useRef } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

// ==========================================
// 1. UTILITAS MATEMATIKA & PRNG (DETERMINISTIK)
// ==========================================

function seededPRNG(a: number) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ==========================================
// 2. KONFIGURASI ENGINE (OPTIMIZED FOR CI)
// ==========================================
const CONFIG = {
    particles: {
        gridColumns: 60,       // Reduced from 90
        gridRows: 60,          // Reduced from 90
        spacing: 65,           // Increased from 50 to cover same area
        ambientCount: 150,     // Reduced from 500
    },
    camera: {
        focalLength: 1200,
        focusDistance: 2500,
        yOffset: -600,
        zOffset: 1500,
        pitch: 0.25,
        yawAmplitude: 0.15,
    },
    wave: {
        baseAmplitude: 350,
        harmonics: [
            { freqX: 0.015, freqZ: 0.02, speed: 1, amp: 1.0 },
            { freqX: 0.03, freqZ: 0.01, speed: -1, amp: 0.5 },
            { freqX: 0.05, freqZ: 0.04, speed: 2, amp: 0.25 },
            { freqX: 0.005, freqZ: 0.008, speed: 1, amp: 1.5 },
        ],
    },
    colors: {
        background: '#010610',
        core: [120, 200, 255],
        glow: [40, 100, 220],
    },
};

// ==========================================
// 3. KOMPONEN REACT / REMOTION UTAMA
// ==========================================
export const CinematicWave: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Pre-compute particle data (flat arrays for performance)
    const particleData = useMemo(() => {
        const rand = seededPRNG(12345);
        const cols = CONFIG.particles.gridColumns;
        const rows = CONFIG.particles.gridRows;
        const spacing = CONFIG.particles.spacing;
        const startX = -((cols * spacing) / 2);
        const startZ = 0;
        const totalGrid = cols * rows;
        const totalAmbient = CONFIG.particles.ambientCount;
        const total = totalGrid + totalAmbient;

        // Flat arrays: x, y, z, size, phase, type(0=grid,1=ambient)
        const px = new Float32Array(total);
        const py = new Float32Array(total);
        const pz = new Float32Array(total);
        const psize = new Float32Array(total);
        const pphase = new Float32Array(total);
        const ptype = new Uint8Array(total);

        // Grid particles
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const idx = i * rows + j;
                const x = startX + i * spacing;
                const z = startZ + j * spacing;
                const distanceToEdgeX = Math.min(i, cols - i) / cols;
                const edgeFalloff = Math.pow(1 - distanceToEdgeX, 3) * 1500;
                px[idx] = x;
                py[idx] = edgeFalloff;
                pz[idx] = z;
                psize[idx] = rand() * 2 + 1.5;
                pphase[idx] = rand() * Math.PI * 2;
                ptype[idx] = 0;
            }
        }

        // Ambient particles
        for (let k = 0; k < totalAmbient; k++) {
            const idx = totalGrid + k;
            px[idx] = (rand() - 0.5) * 8000;
            py[idx] = (rand() - 0.5) * 4000;
            pz[idx] = rand() * 10000;
            psize[idx] = rand() * 8 + 4;
            pphase[idx] = rand() * Math.PI * 2;
            ptype[idx] = 1;
        }

        return { px, py, pz, psize, pphase, ptype, total };
    }, []);

    // Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { px, py, pz, psize, pphase, ptype, total } = particleData;

        // Seamless loop time
        const progress = frame / (durationInFrames - 1);
        const time = progress * Math.PI * 2;
        const cameraYaw = Math.sin(time) * CONFIG.camera.yawAmplitude;

        // Pre-compute trig for camera
        const cosYaw = Math.cos(cameraYaw);
        const sinYaw = Math.sin(cameraYaw);
        const cosPitch = Math.cos(CONFIG.camera.pitch);
        const sinPitch = Math.sin(CONFIG.camera.pitch);
        const fl = CONFIG.camera.focalLength;
        const yOff = CONFIG.camera.yOffset;
        const zOff = CONFIG.camera.zOffset;
        const halfW = width / 2;
        const halfH = height / 2;

        // Clear
        ctx.fillStyle = CONFIG.colors.background;
        ctx.fillRect(0, 0, width, height);

        // Background gradient
        const bgGrad = ctx.createRadialGradient(
            halfW, halfH - 200, 0,
            halfW, halfH - 200, width * 0.8
        );
        bgGrad.addColorStop(0, 'rgba(10, 45, 90, 0.5)');
        bgGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Compute projected positions & sort
        // Store: screenX, screenY, scale, depth, alpha, blur, size, type
        const projected = new Array(total);
        let validCount = 0;

        for (let i = 0; i < total; i++) {
            let x = px[i];
            let y = py[i];
            let z = pz[i];
            const isGrid = ptype[i] === 0;

            // Wave displacement for grid
            if (isGrid) {
                let waveHeight = 0;
                for (const h of CONFIG.wave.harmonics) {
                    waveHeight +=
                        Math.sin(x * h.freqX + z * h.freqZ + time * h.speed) *
                        CONFIG.wave.baseAmplitude *
                        h.amp;
                }
                y += waveHeight;
            } else {
                // Ambient float
                x += Math.sin(time + pphase[i]) * 400;
                y += Math.cos(time + pphase[i]) * 200;
                z += Math.sin(time * 2 + pphase[i]) * 600;
            }

            // Camera transform
            y -= yOff;
            z -= zOff;

            // Yaw rotation
            const rx = x * cosYaw + z * sinYaw;
            const rz = -x * sinYaw + z * cosYaw;
            x = rx;
            z = rz;

            // Pitch rotation
            const ry = y * cosPitch - z * sinPitch;
            z = y * sinPitch + z * cosPitch;
            y = ry;

            // Behind camera check
            if (z < -fl + 100) continue;

            const scale = fl / (fl + z);
            const screenX = halfW + x * scale;
            const screenY = halfH + y * scale;

            // Alpha
            let alpha = 1;
            if (z > 6000) {
                alpha = Math.max(0, 1 - (z - 6000) / 4000);
            } else if (z < 1000) {
                alpha = Math.max(0, z / 1000);
            }
            if (alpha <= 0.05) continue;

            const finalSize = Math.max(0.1, psize[i] * scale);

            projected[validCount++] = {
                screenX,
                screenY,
                size: finalSize,
                depth: z,
                alpha,
                isGrid,
            };
        }

        // Z-sort (far to near)
        projected.length = validCount;
        projected.sort((a, b) => b.depth - a.depth);

        // Draw
        const [cr, cg, cb] = CONFIG.colors.core;
        const [gr, gg, gb] = CONFIG.colors.glow;

        ctx.globalCompositeOperation = 'screen';

        for (let i = 0; i < validCount; i++) {
            const p = projected[i];

            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.screenX, p.screenY, p.size, 0, Math.PI * 2);

            // Simple glow for grid particles (no shadowBlur — too expensive)
            if (p.isGrid && p.size > 1) {
                ctx.fillStyle = `rgba(${gr},${gg},${gb},${p.alpha * 0.3})`;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(p.screenX, p.screenY, p.size * 0.5, 0, Math.PI * 2);
            }

            ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
            ctx.fill();
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        // Vignette
        const vignette = ctx.createRadialGradient(
            halfW, halfH, width * 0.3,
            halfW, halfH, width * 0.7
        );
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.8)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

    }, [frame, width, height, durationInFrames, particleData]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
                backgroundColor: '#000'
            }}
        />
    );
};
