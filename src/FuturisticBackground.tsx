import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const loopProgress = (frame: number, durationInFrames: number) => {
    // 0 → 1 → 0 untuk loop mulus
    const t = frame / durationInFrames; // 0–1
    return t <= 0.5
        ? interpolate(t, [0, 0.5], [0, 1])
        : interpolate(t, [0.5, 1], [1, 0]);
};

const NebulaBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const p = loopProgress(frame, durationInFrames);

    const bgPosX = 50 + Math.sin(p * Math.PI) * 25; // 25% kiri-kanan
    const bgPosY = 50 + Math.cos(p * Math.PI) * 15; // 15% atas-bawah

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#020412',
                backgroundImage:
                    'radial-gradient(circle at 10% 0%, rgba(120, 180, 255, 0.9), transparent 60%),' +
                    'radial-gradient(circle at 90% 20%, rgba(255, 140, 200, 0.8), transparent 60%),' +
                    'radial-gradient(circle at 30% 100%, rgba(130, 255, 210, 0.8), transparent 65%)',
                backgroundSize: '180% 180%',
                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
            }}
        />
    );
};

const BokehParticles: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames, width, height } = useVideoConfig();
    const count = 18;

    return (
        <AbsoluteFill>
            {Array.from({ length: count }).map((_, i) => {
                const base = i + 1;
                const speed = 0.5 + (base % 5) * 0.15; // kecepatan berbeda
                const local = (frame * speed) % durationInFrames;
                const t = local / durationInFrames; // 0–1

                const x = (20 + (base * 137) % 60) + Math.sin(t * Math.PI * 2 + base) * 20;
                const y = (20 + (base * 73) % 60) + Math.cos(t * Math.PI * 2 + base) * 15;

                const size = 120 + (base % 4) * 40;
                const opacity = 0.08 + ((base % 7) * 0.02);

                const color = base % 3 === 0
                    ? 'rgba(255, 255, 255, 0.9)'
                    : base % 3 === 1
                        ? 'rgba(120, 200, 255, 0.9)'
                        : 'rgba(255, 150, 220, 0.9)';

                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: `${x}%`,
                            top: `${y}%`,
                            width: size,
                            height: size,
                            marginLeft: -size / 2,
                            marginTop: -size / 2,
                            borderRadius: '50%',
                            background: color,
                            opacity,
                            filter: 'blur(20px)',
                            mixBlendMode: 'screen',
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};

const GlassPanel: React.FC<{
    index: number;
    centerX: number;
    centerY: number;
    width: number;
    height: number;
}> = ({ index, centerX, centerY, width, height }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const base = index + 1;
    const p = loopProgress(frame, durationInFrames);

    const orbit = 6 + base * 2; // jarak gerak
    const xOffset = Math.sin(p * Math.PI * 2 + base) * orbit;
    const yOffset = Math.cos(p * Math.PI * 2 + base) * orbit * 0.6;

    const rot = Math.sin(p * Math.PI * 2 + base * 0.7) * (3 + base);

    const innerPulse = 0.9 + Math.sin(p * Math.PI * 2 + base) * 0.04;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${centerX + xOffset}%`,
                top: `${centerY + yOffset}%`,
                width,
                height,
                marginLeft: -width / 2,
                marginTop: -height / 2,
                borderRadius: 32,
                background:
                    'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(120,180,255,0.04))',
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow:
                    '0 0 40px rgba(10, 20, 60, 0.8), 0 0 80px rgba(120,180,255,0.45)',
                backdropFilter: 'blur(26px)',
                WebkitBackdropFilter: 'blur(26px)',
                overflow: 'hidden',
                transform: `rotate(${rot}deg)`,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.7,
                    background:
                        'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.32), transparent 55%),' +
                        'linear-gradient(120deg, rgba(140,190,255,0.16), rgba(255,140,200,0.08))',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: '12%',
                    right: '12%',
                    top: '25%',
                    height: 2,
                    borderRadius: 999,
                    background:
                        'linear-gradient(90deg, rgba(120,200,255,0.4), rgba(255,255,255,0.9), rgba(255,150,220,0.4))',
                    transform: `scaleX(${innerPulse})`,
                    transformOrigin: 'center',
                    opacity: 0.9,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: '18%',
                    right: '18%',
                    bottom: '22%',
                    height: '32%',
                    borderRadius: 24,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background:
                        'radial-gradient(circle at 0% 0%, rgba(120,200,255,0.25), transparent 65%)',
                    opacity: 0.6,
                }}
            />
        </div>
    );
};

const CenterLogo: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const fade = interpolate(
        frame,
        [0, 20, durationInFrames - 40, durationInFrames],
        [0, 1, 1, 0]
    );

    const floatY = Math.sin((frame / durationInFrames) * Math.PI * 2) * 6;

    return (
        <AbsoluteFill
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    padding: '28px 64px',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.45)',
                    background:
                        'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.32), transparent 55%),' +
                        'linear-gradient(120deg, rgba(10,10,30,0.9), rgba(20,20,60,0.95))',
                    boxShadow:
                        '0 0 30px rgba(0,0,0,0.9), 0 0 80px rgba(130,190,255,0.7)',
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                    color: 'white',
                    textAlign: 'center',
                    opacity: fade,
                    transform: `translateY(${floatY}px)`,
                }}
            >
                <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: 5 }}>
                    YOUR BRAND
                </div>
                <div
                    style={{
                        fontSize: 20,
                        opacity: 0.85,
                        marginTop: 6,
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                    }}
                >
                    Futuristic Visuals
                </div>
            </div>
        </AbsoluteFill>
    );
};

export const FuturisticBackground: React.FC = () => {
    return (
        <AbsoluteFill>
            <NebulaBackground />
            <BokehParticles />
            <GlassPanel index={0} centerX={30} centerY={35} width={720} height={380} />
            <GlassPanel index={1} centerX={70} centerY={40} width={620} height={340} />
            <GlassPanel index={2} centerX={50} centerY={70} width={760} height={320} />
            <CenterLogo />
        </AbsoluteFill>
    );
};