import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';

const STAR_COUNT = 1200;
const COMET_COUNT = 3;

interface PlanetConfig {
    name: string;
    size: number;
    distance: number;
    color: string;
    orbitSpeed: number; // Putaran per durasi video (harus integer untuk seamless)
    rotationSpeed: number;
    hasRings?: boolean;
    ringColor?: string;
    details?: string;
}

const PLANETS: PlanetConfig[] = [
    // orbitSpeed harus integer agar seamless dalam 15 detik (misal: 1 = 1 putaran penuh per 15 detik)
    { name: 'Mercury', size: 30, distance: 450, color: '#A5A5A5', orbitSpeed: 8, rotationSpeed: 4 },
    { name: 'Venus', size: 55, distance: 650, color: '#E3BB76', orbitSpeed: 6, rotationSpeed: -2 },
    { name: 'Earth', size: 60, distance: 900, color: '#2271B3', orbitSpeed: 4, rotationSpeed: 4, details: 'clouds' },
    { name: 'Mars', size: 45, distance: 1150, color: '#E27B58', orbitSpeed: 3, rotationSpeed: 3 },
    { name: 'Jupiter', size: 160, distance: 1550, color: '#D39C7E', orbitSpeed: 2, rotationSpeed: 8 },
    { name: 'Saturn', size: 140, distance: 2100, color: '#C5AB6E', orbitSpeed: 1, rotationSpeed: 6, hasRings: true, ringColor: 'rgba(197, 171, 110, 0.4)' },
    { name: 'Uranus', size: 90, distance: 2600, color: '#BBE1E4', orbitSpeed: 1, rotationSpeed: -3 },
    { name: 'Neptune', size: 85, distance: 3000, color: '#6081FF', orbitSpeed: 1, rotationSpeed: 3 },
];

const StarField: React.FC = () => {
    const { width, height, durationInFrames } = useVideoConfig();

    const stars = useMemo(() => {
        return new Array(STAR_COUNT).fill(0).map((_, i) => ({
            x: random(`x-${i}`) * width,
            y: random(`y-${i}`) * height,
            size: random(`s-${i}`) * 4.5,
            opacity: random(`o-${i}`),
            // Frekuensi kedipan disesuaikan agar seamless (siklus bulat)
            twinkleFreq: (Math.floor(random(`ts-${i}`) * 10) + 5) * Math.PI * 2 / durationInFrames,
            // Memberikan variasi warna bintang (putih, kebiruan, kekuningan)
            color: random(`c-${i}`) > 0.8 ? '#D0EFFF' : random(`c-${i}`) > 0.9 ? '#FFF4E8' : '#FFFFFF',
            // Menentukan bintang mana yang "terang"
            isBright: random(`b-${i}`) > 0.85,
        }));
    }, [width, height, durationInFrames]);

    const frame = useCurrentFrame();

    return (
        <>
            {stars.map((star, i) => (
                <circle
                    key={i}
                    cx={star.x}
                    cy={star.y}
                    r={star.size}
                    fill={star.color}
                    opacity={star.opacity * (star.isBright ? (0.4 + 0.6 * Math.abs(Math.sin(frame * star.twinkleFreq))) : 0.6)}
                    style={{ filter: star.isBright ? `blur(${star.size * 0.2}px) drop-shadow(0 0 ${star.size}px ${star.color})` : 'none' }}
                />
            ))}
        </>
    );
};

const Comet: React.FC<{ index: number }> = ({ index }) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const seed = index * 100;

    // Variasi properti komet berdasarkan index
    const angle = interpolate(random(seed + 1), [0, 1], [-20, 20]); // Sudut melintas
    const cometSpeed = Math.floor(random(seed + 2) * 2) + 1; // 1 atau 2 kali melintas per loop
    const size = interpolate(random(seed + 3), [0, 1], [1, 4]);
    const tailLength = interpolate(random(seed + 4), [0, 1], [100, 400]);
    const startY = interpolate(random(seed + 5), [0, 1], [0, height]);

    const progress = (frame / durationInFrames * cometSpeed) % 1;

    const startX = -500;
    const endX = width + 500;
    const x = interpolate(progress, [0, 1], [startX, endX]);
    // Y bergeser sedikit berdasarkan sudut untuk variasi lintasan
    const y = startY + (x - startX) * Math.tan(angle * Math.PI / 180);

    const cometColor = random(seed + 6) > 0.5 ? '#94e2fb' : '#ffffff';

    return (
        <g
            style={{
                opacity: Math.sin(progress * Math.PI), // Muncul dan hilang halus
                transform: `rotate(${angle}deg)`,
                transformOrigin: `${x}px ${y}px`
            }}
        >
            <defs>
                <linearGradient id={`comet-tail-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="100%" stopColor={cometColor} />
                </linearGradient>
            </defs>
            <rect x={x - tailLength} y={y - size / 2} width={tailLength} height={size} fill={`url(#comet-tail-${index})`} />
            <circle cx={x} cy={y} r={size} fill="white" style={{ filter: `blur(1px) drop-shadow(0 0 5px ${cometColor})` }} />
        </g>
    );
};

export const SolarSystem: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const centerX = width / 2;
    const centerY = height / 2;

    // Efek matahari berdenyut perlahan
    const sunPulse = Math.sin(frame * Math.PI * 2 / 120) * 5 + 120;

    return (
        <AbsoluteFill style={{ backgroundColor: '#02040a' }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    <filter id="sun-glow">
                        <feGaussianBlur stdDeviation={15 + Math.sin(frame * 0.1) * 5} result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <radialGradient id="sun-grad">
                        <stop offset="0%" stopColor="#FFF5E1" />
                        <stop offset="50%" stopColor="#FFD700" />
                        <stop offset="100%" stopColor="#FF4500" />
                    </radialGradient>

                    {PLANETS.map((p) => (
                        <radialGradient id={`grad-${p.name}`} key={p.name} cx="30%" cy="30%">
                            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                            <stop offset="100%" stopColor={p.color} />
                        </radialGradient>
                    ))}
                </defs>

                <StarField />

                {new Array(COMET_COUNT).fill(0).map((_, i) => (
                    <Comet key={i} index={i} />
                ))}

                {/* Orbit Lines */}
                {PLANETS.map((p) => (
                    <ellipse
                        key={`orbit-${p.name}`}
                        cx={centerX}
                        cy={centerY}
                        rx={p.distance}
                        ry={p.distance * 0.6} // Perspektif miring
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2"
                    />
                ))}

                {/* Matahari */}
                <circle cx={centerX} cy={centerY} r={sunPulse + 40} fill="url(#sun-grad)" opacity="0.15" />
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={sunPulse}
                    fill="url(#sun-grad)"
                    filter="url(#sun-glow)"
                />

                {/* Planet-planet */}
                {PLANETS.map((p) => {
                    // Kalkulasi posisi orbit (Seamless: orbitSpeed * 2PI)
                    const angle = (frame / durationInFrames) * (Math.PI * 2) * p.orbitSpeed;
                    const px = centerX + Math.cos(angle) * p.distance;
                    const py = centerY + Math.sin(angle) * p.distance * 0.6;

                    // Simulasi rotasi planet pada sumbunya
                    const selfRotation = (frame / durationInFrames) * 360 * p.rotationSpeed;

                    return (
                        <g key={p.name}>
                            {/* Bayangan Planet */}
                            <circle
                                cx={px + 5}
                                cy={py + 5}
                                r={p.size}
                                fill="black"
                                opacity="0.4"
                            />

                            {/* Rings (khusus Saturnus) */}
                            {p.hasRings && (
                                <ellipse
                                    cx={px}
                                    cy={py}
                                    rx={p.size * 2.2}
                                    ry={p.size * 0.8}
                                    fill="none"
                                    stroke={p.ringColor}
                                    strokeWidth={p.size * 0.4}
                                    style={{
                                        transform: `rotate(${25}deg)`,
                                        transformOrigin: `${px}px ${py}px`
                                    }}
                                />
                            )}

                            {/* Tubuh Planet */}
                            <circle
                                cx={px}
                                cy={py}
                                r={p.size}
                                fill={`url(#grad-${p.name})`}
                            />

                            {/* Detail Atmosfer/Awan (Sederhana) */}
                            {p.details === 'clouds' && (
                                <ellipse
                                    cx={px - p.size * 0.2}
                                    cy={py - p.size * 0.1}
                                    rx={p.size * 0.6}
                                    ry={p.size * 0.2}
                                    fill="white"
                                    opacity="0.2"
                                    style={{
                                        transform: `rotate(${selfRotation}deg)`,
                                        transformOrigin: `${px}px ${py}px`
                                    }}
                                />
                            )}

                            {/* Glow Planet */}
                            <circle
                                cx={px}
                                cy={py}
                                r={p.size}
                                fill="none"
                                stroke={p.color}
                                strokeWidth="2"
                                opacity="0.5"
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Overlay Lens Flare Efek Mahal */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 100%)',
                pointerEvents: 'none'
            }} />
        </AbsoluteFill>
    );
};