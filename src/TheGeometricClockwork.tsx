import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    Easing,
} from 'remotion';

// Sub-komponen untuk merender Gerigi secara prosedural
const Gear: React.FC<{
    teeth: number;
    radius: number;
    color: string;
    rotation: number;
    thickness?: number;
    showInnerDetails?: boolean;
}> = ({ teeth, radius, color, rotation, thickness = 3, showInnerDetails = true }) => {
    const gearPath = useMemo(() => {
        let path = "";
        const innerR = radius * 0.9;
        const outerR = radius * 1.05;
        const step = (Math.PI * 2) / teeth;

        for (let i = 0; i < teeth; i++) {
            const angle = i * step;
            const x1 = Math.cos(angle - step * 0.2) * innerR;
            const y1 = Math.sin(angle - step * 0.2) * innerR;
            const x2 = Math.cos(angle - step * 0.1) * outerR;
            const y2 = Math.sin(angle - step * 0.1) * outerR;
            const x3 = Math.cos(angle + step * 0.1) * outerR;
            const y3 = Math.sin(angle + step * 0.1) * outerR;
            const x4 = Math.cos(angle + step * 0.2) * innerR;
            const y4 = Math.sin(angle + step * 0.2) * innerR;

            if (i === 0) path += `M ${x1} ${y1}`;
            path += ` L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4}`;
        }
        return path + " Z";
    }, [teeth, radius]);

    return (
        <g transform={`rotate(${rotation})`}>
            {/* Shadow for depth */}
            <path d={gearPath} fill="none" stroke="black" strokeWidth={thickness + 2} opacity={0.3} transform="translate(4, 4)" />
            <path d={gearPath} fill="none" stroke={color} strokeWidth={thickness} strokeLinejoin="round" />

            {showInnerDetails && (
                <>
                    <circle r={radius * 0.7} fill="none" stroke={color} strokeWidth={thickness * 0.5} opacity={0.4} />
                    {[...Array(6)].map((_, i) => (
                        <line
                            key={i}
                            x1={0} y1={0}
                            x2={Math.cos(i * Math.PI / 3) * radius * 0.7}
                            y2={Math.sin(i * Math.PI / 3) * radius * 0.7}
                            stroke={color} strokeWidth={thickness * 0.8} opacity={0.5}
                        />
                    ))}
                    <circle r={radius * 0.15} fill={color} opacity={0.8} />
                </>
            )}
        </g>
    );
};

// Komponen Utama
export const GeometricClockwork: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Progress 0-1 untuk looping sempurna
    const loopProgress = frame / durationInFrames;
    const rotationBase = loopProgress * 360;

    // Warna Premium: Gold & Slate
    const colors = {
        gold: "#D4AF37",
        brightGold: "#FFD700",
        slate: "#2C3E50",
        accent: "#E5E4E2"
    };

    return (
        <AbsoluteFill style={{ backgroundColor: '#050505', overflow: 'hidden' }}>
            {/* Background Subtle Grid */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `radial-gradient(${colors.slate} 1px, transparent 1px)`,
                backgroundSize: '80px 80px',
                opacity: 0.1
            }} />

            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.2))' }}>
                <g transform={`translate(${width / 2}, ${height / 2})`}>

                    {/* 1. Outer Technical Rings (Slow Rotation) */}
                    <g transform={`rotate(${-rotationBase * 0.2})`}>
                        <circle r={900} fill="none" stroke={colors.gold} strokeWidth="1" strokeDasharray="10 20" opacity="0.2" />
                        <circle r={850} fill="none" stroke={colors.accent} strokeWidth="4" strokeDasharray="2 100" opacity="0.5" />
                    </g>

                    {/* 2. Massive Background Gear */}
                    <g opacity={0.15}>
                        <Gear
                            teeth={120} radius={1100} color={colors.gold}
                            rotation={rotationBase * 0.1} thickness={10} showInnerDetails={false}
                        />
                    </g>

                    {/* 3. Middle Orbiting System */}
                    {[...Array(4)].map((_, i) => {
                        const orbitRadius = 600;
                        const angle = (i * Math.PI / 2) + (loopProgress * Math.PI * 0.5);
                        const x = Math.cos(angle) * orbitRadius;
                        const y = Math.sin(angle) * orbitRadius;

                        return (
                            <g key={i} transform={`translate(${x}, ${y})`}>
                                <Gear
                                    teeth={40} radius={180} color={colors.gold}
                                    rotation={-rotationBase * 2.5} thickness={4}
                                />
                                {/* Tiny satellite gear */}
                                <g transform={`translate(${Math.cos(angle) * 220}, ${Math.sin(angle) * 220})`}>
                                    <Gear
                                        teeth={12} radius={40} color={colors.accent}
                                        rotation={rotationBase * 5} thickness={2}
                                    />
                                </g>
                            </g>
                        );
                    })}

                    {/* 4. Central Master Clockwork */}
                    <g transform={`scale(${interpolate(Math.sin(loopProgress * Math.PI * 2), [-1, 1], [0.98, 1.02])})`}>
                        {/* Central Hub */}
                        <Gear
                            teeth={60} radius={350} color={colors.brightGold}
                            rotation={rotationBase} thickness={6}
                        />

                        {/* Counter-rotating inner ring */}
                        <g transform={`rotate(${-rotationBase * 1.5})`}>
                            <circle r={250} fill="none" stroke={colors.accent} strokeWidth="20" strokeDasharray="1 15" />
                            <Gear
                                teeth={30} radius={200} color={colors.accent}
                                rotation={0} thickness={4}
                            />
                        </g>
                    </g>

                    {/* 5. Foregound Large Decorative Rings */}
                    <g transform={`rotate(${rotationBase * 0.05})`}>
                        <circle r={1020} fill="none" stroke={colors.gold} strokeWidth="2" strokeDasharray="200 400" opacity="0.3" />
                        <circle r={1040} fill="none" stroke={colors.accent} strokeWidth="1" opacity="0.1" />
                    </g>
                </g>
            </svg>

            {/* Cinematic Lens Dirt / Particles */}
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: 4,
                        height: 4,
                        backgroundColor: colors.gold,
                        borderRadius: '50%',
                        left: `${(i * 7) % 100}%`,
                        top: `${(i * 13) % 100}%`,
                        opacity: 0.2,
                        filter: 'blur(2px)',
                    }}
                />
            ))}
        </AbsoluteFill>
    );
};