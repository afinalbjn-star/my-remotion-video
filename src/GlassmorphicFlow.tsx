import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    random,
    spring,
} from 'remotion';

const Card: React.FC<{ seed: number }> = ({ seed }) => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();

    const config = useMemo(() => {
        return {
            x: random(seed + 1) * width,
            y: random(seed + 2) * height,
            size: 300 + random(seed + 3) * 400,
            delay: random(seed + 4) * 60,
            speed: 0.5 + random(seed + 5) * 1,
        };
    }, [seed, width, height]);

    const appearance = spring({
        frame: frame - config.delay,
        fps,
        config: { stiffness: 60 },
    });

    // Sinkronisasi dengan durasi untuk seamless loop
    const t = (frame / durationInFrames) * Math.PI * 2;
    const floatY = Math.sin(t * Math.floor(config.speed * 2)) * 30;
    const rotate = Math.cos(t * Math.floor(config.speed)) * 5;

    return (
        <div
            style={{
                position: 'absolute',
                left: config.x,
                top: config.y,
                width: config.size,
                height: config.size * 0.6,
                transform: `translate(-50%, -50%) scale(${appearance}) translateY(${floatY}px) rotate(${rotate}deg)`,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: 40,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                padding: 40,
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: appearance,
            }}
        >
            <div style={{ width: 60, height: 10, background: 'rgba(255,255,255,0.3)', borderRadius: 5 }} />
            <div style={{ display: 'flex', gap: 15 }}>
                <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                    <div style={{ width: '80%', height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
                    <div style={{ width: '50%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
                </div>
            </div>
        </div>
    );
};

export const GlassmorphicFlow: React.FC = () => {
    const { width, height } = useVideoConfig();

    return (
        <AbsoluteFill
            style={{
                background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)',
                overflow: 'hidden',
            }}
        >
            {/* Dekorasi Latar Belakang */}
            <div
                style={{
                    position: 'absolute',
                    width: width * 0.8,
                    height: width * 0.8,
                    background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)',
                    top: -200,
                    right: -200,
                    opacity: 0.6,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    width: width * 0.6,
                    height: width * 0.6,
                    background: 'radial-gradient(circle, #c084fc 0%, transparent 70%)',
                    bottom: -100,
                    left: -100,
                    opacity: 0.4,
                }}
            />

            {[...Array(12)].map((_, i) => (
                <Card key={i} seed={i * 100} />
            ))}
        </AbsoluteFill>
    );
};