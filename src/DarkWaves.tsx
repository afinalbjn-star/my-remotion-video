import React, { useRef, useMemo, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * ============================================================================
 * DARK WAVES — Abstract dark waves with teal highlights
 * 
 * A near-black canvas (#060f14) with flowing abstract wave forms
 * and subtle teal/cyan highlights (#2b768e, #418fa8).
 * Designed as a seamless 10-second loop at 4K (3840×2160).
 * ============================================================================
 */

export const VIDEO_CONFIG = {
    width: 3840,
    height: 2160,
    fps: 60,
    durationInFrames: 600, // 10 seconds
};

interface WaveLayer {
    id: string;
    baseYRatio: number;
    amplitude: number;
    frequency: number;
    speedFactor: number;
    loopCycles: number;
    lineWidth: number;
    opacity: number;
    color: string;
    glowColor: string;
    glowBlur: number;
    strandCount: number;
    strandSpacing: number;
}

const WAVE_LAYERS: WaveLayer[] = [
    // Deep background waves — very subtle, wide, slow
    {
        id: 'deep-bg-wave',
        baseYRatio: 0.5,
        amplitude: 300,
        frequency: 0.0004,
        speedFactor: 0.3,
        loopCycles: 1,
        lineWidth: 0.6,
        opacity: 0.12,
        color: 'rgba(10, 30, 38, 0.8)',
        glowColor: 'rgba(15, 50, 60, 0.08)',
        glowBlur: 40,
        strandCount: 8,
        strandSpacing: 30,
    },
    // Mid-layer waves — moderate teal presence
    {
        id: 'mid-teal-wave',
        baseYRatio: 0.45,
        amplitude: 180,
        frequency: 0.0007,
        speedFactor: 0.6,
        loopCycles: 1,
        lineWidth: 0.8,
        opacity: 0.25,
        color: 'rgba(43, 118, 142, 0.35)',
        glowColor: 'rgba(43, 118, 142, 0.12)',
        glowBlur: 25,
        strandCount: 12,
        strandSpacing: 16,
    },
    // Primary highlight wave — brighter teal, thinner
    {
        id: 'primary-teal-highlight',
        baseYRatio: 0.48,
        amplitude: 120,
        frequency: 0.001,
        speedFactor: 0.85,
        loopCycles: 1,
        lineWidth: 1.0,
        opacity: 0.45,
        color: 'rgba(65, 143, 168, 0.5)',
        glowColor: 'rgba(65, 143, 168, 0.2)',
        glowBlur: 18,
        strandCount: 6,
        strandSpacing: 10,
    },
    // Accent wave — brightest teal, narrow, fast
    {
        id: 'accent-highlight',
        baseYRatio: 0.52,
        amplitude: 80,
        frequency: 0.0015,
        speedFactor: 1.2,
        loopCycles: 2,
        lineWidth: 1.2,
        opacity: 0.35,
        color: 'rgba(80, 170, 195, 0.45)',
        glowColor: 'rgba(80, 170, 195, 0.15)',
        glowBlur: 12,
        strandCount: 4,
        strandSpacing: 8,
    },
    // Upper subtle wave
    {
        id: 'upper-subtle',
        baseYRatio: 0.3,
        amplitude: 100,
        frequency: 0.0006,
        speedFactor: -0.5,
        loopCycles: 1,
        lineWidth: 0.5,
        opacity: 0.15,
        color: 'rgba(30, 80, 95, 0.3)',
        glowColor: 'rgba(30, 80, 95, 0.06)',
        glowBlur: 30,
        strandCount: 6,
        strandSpacing: 20,
    },
    // Lower subtle wave
    {
        id: 'lower-subtle',
        baseYRatio: 0.7,
        amplitude: 130,
        frequency: 0.0005,
        speedFactor: -0.4,
        loopCycles: 1,
        lineWidth: 0.5,
        opacity: 0.12,
        color: 'rgba(25, 70, 85, 0.25)',
        glowColor: 'rgba(25, 70, 85, 0.05)',
        glowBlur: 35,
        strandCount: 5,
        strandSpacing: 22,
    },
];

interface Particle {
    xRatio: number;
    yRatio: number;
    size: number;
    opacity: number;
    speedY: number;
    phase: number;
}

const PARTICLE_COUNT = 80;

function generateParticles(): Particle[] {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const seed1 = Math.sin(i * 43758.5453) * 0.5 + 0.5;
        const seed2 = Math.cos(i * 12.9898) * 0.5 + 0.5;
        const seed3 = Math.sin(i * 98.412) * 0.5 + 0.5;
        particles.push({
            xRatio: seed1,
            yRatio: seed2,
            size: seed3 * 3 + 0.5,
            opacity: seed1 * 0.3 + 0.05,
            speedY: (seed2 - 0.5) * 0.15,
            phase: seed3 * Math.PI * 2,
        });
    }
    return particles;
}

function sineWave(
    x: number,
    baseY: number,
    amplitude: number,
    frequency: number,
    phase: number,
    harmonics: number = 3
): number {
    let y = 0;
    for (let h = 1; h <= harmonics; h++) {
        y += Math.sin(x * frequency * h + phase * h) * (amplitude / h);
    }
    return baseY + y;
}

export const DarkWaves: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const progress = frame / durationInFrames;
    const particles = useMemo(() => generateParticles(), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // === BACKGROUND ===
        // Near-black base matching the reference: #060f14
        ctx.fillStyle = '#060f14';
        ctx.fillRect(0, 0, width, height);

        // Subtle radial vignette — slightly brighter center
        const vignette = ctx.createRadialGradient(
            width * 0.5, height * 0.5, 0,
            width * 0.5, height * 0.5, width * 0.7
        );
        vignette.addColorStop(0, 'rgba(10, 25, 32, 0.3)');
        vignette.addColorStop(0.5, 'rgba(8, 20, 26, 0.15)');
        vignette.addColorStop(1, 'rgba(4, 10, 14, 0)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // === WAVE LAYERS ===
        for (const layer of WAVE_LAYERS) {
            const phase = progress * Math.PI * 2 * layer.loopCycles * layer.speedFactor;
            const baseY = height * layer.baseYRatio;

            // Glow pass
            if (layer.glowBlur > 0) {
                ctx.save();
                ctx.filter = `blur(${layer.glowBlur}px)`;
                ctx.globalAlpha = layer.opacity * 0.6;
                ctx.strokeStyle = layer.glowColor;
                ctx.lineWidth = layer.lineWidth * 8;
                ctx.beginPath();
                for (let x = -20; x <= width + 20; x += 4) {
                    const y = sineWave(x, baseY, layer.amplitude, layer.frequency, phase);
                    if (x === -20) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.restore();
            }

            // Strand passes
            for (let s = 0; s < layer.strandCount; s++) {
                const offset = (s - layer.strandCount / 2) * layer.strandSpacing;
                const strandOpacity = layer.opacity * (1 - Math.abs(s - layer.strandCount / 2) / (layer.strandCount / 2) * 0.6);

                ctx.save();
                ctx.globalAlpha = strandOpacity;
                ctx.strokeStyle = layer.color;
                ctx.lineWidth = layer.lineWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();

                for (let x = -20; x <= width + 20; x += 3) {
                    const y = sineWave(x, baseY + offset, layer.amplitude * (0.8 + 0.2 * Math.sin(s * 0.5)), layer.frequency, phase + s * 0.3);
                    if (x === -20) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.restore();
            }
        }

        // === FLOATING PARTICLES ===
        for (const p of particles) {
            const px = p.xRatio * width;
            const py = ((p.yRatio + progress * p.speedY) % 1) * height;
            const flickerOpacity = p.opacity * (0.7 + 0.3 * Math.sin(frame * 0.05 + p.phase));

            ctx.save();
            ctx.globalAlpha = flickerOpacity;
            ctx.fillStyle = 'rgba(65, 143, 168, 0.8)';
            ctx.shadowColor = 'rgba(65, 143, 168, 0.4)';
            ctx.shadowBlur = p.size * 3;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // === SUBTLE HORIZONTAL LIGHT STREAKS ===
        for (let i = 0; i < 5; i++) {
            const streakY = height * (0.3 + i * 0.1);
            const streakPhase = progress * Math.PI * 2 + i * 1.2;
            const streakOpacity = 0.03 + 0.02 * Math.sin(streakPhase);

            ctx.save();
            ctx.globalAlpha = streakOpacity;
            const streakGrad = ctx.createLinearGradient(0, streakY - 30, 0, streakY + 30);
            streakGrad.addColorStop(0, 'transparent');
            streakGrad.addColorStop(0.5, 'rgba(43, 118, 142, 0.3)');
            streakGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = streakGrad;
            ctx.fillRect(0, streakY - 30, width, 60);
            ctx.restore();
        }

    }, [frame, width, height, durationInFrames, progress, particles]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#060f14',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                }}
            />
        </div>
    );
};

export default DarkWaves;
