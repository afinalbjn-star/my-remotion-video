import React, { useEffect, useRef, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * ============================================================================
 * INTERFACES & CONFIGURATION TYPES
 * ============================================================================
 */

export interface ColorStop {
    offset: number;
    color: string;
}

export interface SilkRibbonLayer {
    id: string;
    baseYRatio: number;          // Posisi vertikal relatif (0 = atas, 1 = bawah)
    amplitude: number;           // Tinggi gelombang dalam piksel
    frequency: number;           // Kerapatan gelombang
    strandCount: number;         // Jumlah helai garis dalam satu pita sutra
    strandSpacing: number;       // Jarak pergeseran antar helai garis
    baseLineWidth: number;       // Tebal garis dasar
    baseOpacity: number;         // Opasitas dasar (0 - 1)
    speedFactor: number;         // Kecepatan pergerakan pita
    loopCycles: number;          // Jumlah siklus rotasi fase penuh per durasi video
    glowIntensity: number;       // Efek bayangan bersinar (blur radius)
    glowColor: string;           // Warna pendaran komposit
}

export interface ParticleSettings {
    enabled: boolean;
    count: number;
    maxSize: number;
    minOpacity: number;
    maxOpacity: number;
    speedY: number;
}

export interface ThemePalette {
    name: string;
    background: string;
    gradients: ColorStop[][];
}

const PALETTES: Record<string, ThemePalette> = {
    luxuryGold: {
        name: 'Luxury Gold',
        background: '#060608',
        gradients: [
            [
                { offset: 0, color: 'rgba(212, 175, 55, 0.15)' },
                { offset: 0.5, color: 'rgba(245, 222, 179, 0.30)' },
                { offset: 1, color: 'rgba(184, 134, 11, 0.05)' }
            ],
            [
                { offset: 0, color: 'rgba(255, 215, 0, 0.20)' },
                { offset: 0.7, color: 'rgba(139, 101, 8, 0.10)' },
                { offset: 1, color: 'rgba(255, 248, 220, 0.02)' }
            ],
            [
                { offset: 0, color: 'rgba(197, 160, 89, 0.12)' },
                { offset: 0.5, color: 'rgba(255, 226, 153, 0.25)' },
                { offset: 1, color: 'rgba(50, 40, 20, 0.00)' }
            ]
        ]
    },
    cosmicNeon: {
        name: 'Cosmic Neon',
        background: '#030207',
        gradients: [
            [
                { offset: 0, color: 'rgba(0, 242, 254, 0.20)' },
                { offset: 0.6, color: 'rgba(79, 79, 229, 0.15)' },
                { offset: 1, color: 'rgba(127, 0, 255, 0.05)' }
            ],
            [
                { offset: 0, color: 'rgba(253, 56, 141, 0.18)' },
                { offset: 0.5, color: 'rgba(255, 0, 128, 0.12)' },
                { offset: 1, color: 'rgba(0, 0, 0, 0.00)' }
            ]
        ]
    }
};

export const SineWaveSilk: React.FC<{
    theme?: 'luxuryGold' | 'cosmicNeon';
    customLayers?: SilkRibbonLayer[];
    particleSettings?: ParticleSettings;
}> = ({
    theme = 'luxuryGold',
    customLayers,
    particleSettings
}) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const frame = useCurrentFrame();
        const { width, height, durationInFrames } = useVideoConfig();

        const progress = frame / durationInFrames;
        const activePalette = useMemo(() => PALETTES[theme] || PALETTES.luxuryGold, [theme]);

        const layers: SilkRibbonLayer[] = useMemo(() => {
            if (customLayers) return customLayers;
            return [
                {
                    id: 'primary-silk-ribbon',
                    baseYRatio: 0.45,
                    amplitude: 140,
                    frequency: 0.0012,
                    strandCount: 16,
                    strandSpacing: 12,
                    baseLineWidth: 1.2,
                    baseOpacity: 0.85,
                    speedFactor: 1.0,
                    loopCycles: 1,
                    glowIntensity: 15,
                    glowColor: theme === 'luxuryGold' ? 'rgba(212,175,55,0.2)' : 'rgba(0,242,254,0.2)'
                },
                {
                    id: 'secondary-ambient-ribbon',
                    baseYRatio: 0.55,
                    amplitude: 220,
                    frequency: 0.0008,
                    strandCount: 22,
                    strandSpacing: 18,
                    baseLineWidth: 0.8,
                    baseOpacity: 0.50,
                    speedFactor: -0.7,
                    loopCycles: 1,
                    glowIntensity: 0,
                    glowColor: 'transparent'
                },
                {
                    id: 'tertiary-deep-shadow-ribbon',
                    baseYRatio: 0.35,
                    amplitude: 90,
                    frequency: 0.0022,
                    strandCount: 10,
                    strandSpacing: 25,
                    baseLineWidth: 0.6,
                    baseOpacity: 0.40,
                    speedFactor: 1.3,
                    loopCycles: 2,
                    glowIntensity: 8,
                    glowColor: theme === 'luxuryGold' ? 'rgba(184,134,11,0.1)' : 'rgba(127,0,255,0.1)'
                }
            ];
        }, [customLayers, theme]);

        const activeParticles: ParticleSettings = useMemo(() => {
            return particleSettings || {
                enabled: true,
                count: 120,
                maxSize: 4.5,
                minOpacity: 0.05,
                maxOpacity: 0.45,
                speedY: -0.3
            };
        }, [particleSettings]);

        const calculatedParticles = useMemo(() => {
            const store = [];
            for (let i = 0; i < activeParticles.count; i++) {
                const seedX = Math.sin(i * 43758.5453) * 0.5 + 0.5;
                const seedY = Math.cos(i * 12.9898) * 0.5 + 0.5;
                const seedSize = Math.sin(i * 98.412) * 0.5 + 0.5;
                store.push({
                    xRatio: seedX,
                    yRatio: seedY,
                    size: seedSize * activeParticles.maxSize + 1,
                    opacityRatio: seedX
                });
            }
            return store;
        }, [activeParticles]);

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.fillStyle = activePalette.background;
            ctx.fillRect(0, 0, width, height);

            const bgGradient = ctx.createRadialGradient(
                width * 0.5, height * 0.5, 100,
                width * 0.5, height * 0.5, width * 0.8
            );
            if (theme === 'luxuryGold') {
                bgGradient.addColorStop(0, 'rgba(30, 24, 10, 0.4)');
                bgGradient.addColorStop(1, 'rgba(6, 6, 8, 1.0)');
            } else {
                bgGradient.addColorStop(0, 'rgba(25, 10, 45, 0.4)');
                bgGradient.addColorStop(1, 'rgba(3, 2, 7, 1.0)');
            }
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);

            if (activeParticles.enabled) {
                calculatedParticles.forEach((particle) => {
                    const totalVerticalShift = progress * activeParticles.speedY;
                    let currentYRatio = (particle.yRatio + totalVerticalShift) % 1.0;
                    if (currentYRatio < 0) currentYRatio += 1.0;

                    const pixelX = particle.xRatio * width;
                    const pixelY = currentYRatio * height;
                    const edgeFade = Math.sin(currentYRatio * Math.PI);
                    const finalOpacity = (activeParticles.minOpacity +
                        (particle.opacityRatio * (activeParticles.maxOpacity - activeParticles.minOpacity))) * edgeFade;

                    ctx.beginPath();
                    ctx.arc(pixelX, pixelY, particle.size, 0, 2 * Math.PI);
                    ctx.fillStyle = theme === 'luxuryGold'
                        ? `rgba(245, 222, 179, ${finalOpacity})`
                        : `rgba(0, 242, 254, ${finalOpacity})`;
                    ctx.fill();
                });
            }

            layers.forEach((layer, layerIdx) => {
                const masterPhaseShift = progress * 2 * Math.PI * layer.loopCycles * layer.speedFactor;
                const centerY = height * layer.baseYRatio;
                const gradientIndex = layerIdx % activePalette.gradients.length;
                const gradientDefinition = activePalette.gradients[gradientIndex];

                const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
                gradientDefinition.forEach((stop) => {
                    lineGradient.addColorStop(stop.offset, stop.color);
                });

                if (layer.glowIntensity > 0) {
                    ctx.shadowBlur = layer.glowIntensity;
                    ctx.shadowColor = layer.glowColor;
                } else {
                    ctx.shadowBlur = 0;
                    ctx.shadowColor = 'transparent';
                }

                for (let s = 0; s < layer.strandCount; s++) {
                    const strandPhaseOffset = s * (layer.strandSpacing * 0.005);
                    const centerWeight = Math.sin((s / layer.strandCount) * Math.PI);
                    ctx.strokeStyle = lineGradient;
                    ctx.lineWidth = layer.baseLineWidth * (0.4 + centerWeight * 0.6);
                    ctx.globalAlpha = layer.baseOpacity * (0.15 + centerWeight * 0.85);

                    ctx.beginPath();
                    const stepSize = 6;
                    for (let x = 0; x <= width; x += stepSize) {
                        const angleA = x * layer.frequency + masterPhaseShift + strandPhaseOffset;
                        const angleB = x * (layer.frequency * 2.3) - (masterPhaseShift * 0.5) + (s * 0.02);
                        const screenEdgeTaper = Math.sin((x / width) * Math.PI);
                        const componentWaveA = Math.sin(angleA);
                        const componentWaveB = Math.cos(angleB) * 0.35;
                        const calculatedWaveY = centerY +
                            (componentWaveA + componentWaveB) * layer.amplitude * screenEdgeTaper;

                        if (x === 0) {
                            ctx.moveTo(x, calculatedWaveY);
                        } else {
                            ctx.lineTo(x, calculatedWaveY);
                        }
                    }
                    ctx.stroke();
                }
                ctx.globalAlpha = 1.0;
            });

            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';

        }, [frame, width, height, progress, layers, activePalette, calculatedParticles, activeParticles, theme]);

        return (
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'contain',
                        backgroundColor: activePalette.background,
                    }}
                />
            </div>
        );
    };

export default SineWaveSilk;