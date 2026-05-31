import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const loopT = (frame: number, durationInFrames: number) => {
    const t = (frame % durationInFrames) / durationInFrames; // 0–1
    return t;
};

const OrganicShape: React.FC<{
    index: number;
    baseX: number;
    baseY: number;
    baseW: number;
    baseH: number;
}> = ({ index, baseX, baseY, baseW, baseH }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const t = loopT(frame, durationInFrames);

    const phase = index * 1.1;
    const offsetX = Math.sin(t * Math.PI * 2 + phase) * 4; // slow, subtle
    const offsetY = Math.cos(t * Math.PI * 2 + phase) * 3;
    const scale = 1 + Math.sin(t * Math.PI * 2 + phase) * 0.04;
    const rotate = Math.sin(t * Math.PI * 2 + phase * 0.5) * 4;

    const blur = 40 + (index % 3) * 10;
    const opacity = 0.30 + (index % 3) * 0.07;

    const gradient = index % 2 === 0
        ? 'linear-gradient(135deg, rgba(40,70,130,0.95), rgba(8,18,40,0.0))'
        : 'linear-gradient(135deg, rgba(70,105,170,0.95), rgba(12,26,55,0.0))';

    return (
        <div
            style={{
                position: 'absolute',
                left: `${baseX + offsetX}%`,
                top: `${baseY + offsetY}%`,
                width: baseW,
                height: baseH,
                marginLeft: -baseW / 2,
                marginTop: -baseH / 2,
                borderRadius: '60% 40% 55% 45% / 55% 45% 60% 40%', // organic blob
                backgroundImage: gradient,
                opacity,
                filter: `blur(${blur}px)`,
                mixBlendMode: 'screen',
                transform: `scale(${scale}) rotate(${rotate}deg)`,
            }}
        />
    );
};

const GlassStrip: React.FC<{
    index: number;
    x: number;
    y: number;
    w: number;
    h: number;
}> = ({ index, x, y, w, h }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const t = loopT(frame, durationInFrames);
    const phase = index * 0.9;

    const offsetX = Math.sin(t * Math.PI * 2 + phase) * 2;
    const offsetY = Math.cos(t * Math.PI * 2 + phase) * 1.3;
    const rot = Math.sin(t * Math.PI * 2 + phase) * 2;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${x + offsetX}%`,
                top: `${y + offsetY}%`,
                width: w,
                height: h,
                marginLeft: -w / 2,
                marginTop: -h / 2,
                borderRadius: 32,
                background:
                    'linear-gradient(145deg, rgba(255,255,255,0.12), rgba(70,100,150,0.04))',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow:
                    '0 20px 60px rgba(0,0,0,0.7), 0 0 70px rgba(70,110,170,0.45)',
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
                    background:
                        'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.25), transparent 60%),' +
                        'linear-gradient(120deg, rgba(120,155,210,0.18), rgba(10,20,35,0.0))',
                    opacity: 0.9,
                }}
            />
        </div>
    );
};

const SoftVignette: React.FC = () => (
    <div
        style={{
            position: 'absolute',
            inset: 0,
            background:
                'radial-gradient(circle at 50% -10%, rgba(255,255,255,0.14), transparent 65%),' +
                'radial-gradient(circle at 50% 115%, rgba(0,0,0,0.8), transparent 55%)',
            mixBlendMode: 'soft-light',
        }}
    />
);

export const CorporateAbstractBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const t = loopT(frame, durationInFrames);

    const bgX = 50 + Math.sin(t * Math.PI * 2) * 10;
    const bgY = 50 + Math.cos(t * Math.PI * 2) * 6;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#050814',
                backgroundImage:
                    'radial-gradient(circle at 0% 0%, #1b273d, transparent 55%),' +
                    'radial-gradient(circle at 100% 10%, #233656, transparent 60%),' +
                    'radial-gradient(circle at 25% 100%, #141b2b, transparent 65%)',
                backgroundSize: '180% 180%',
                backgroundPosition: `${bgX}% ${bgY}%`,
            }}
        >
            <SoftVignette />

            {/* organic geometric shapes */}
            <OrganicShape index={0} baseX={30} baseY={35} baseW={1200} baseH={900} />
            <OrganicShape index={1} baseX={70} baseY={45} baseW={1100} baseH={820} />
            <OrganicShape index={2} baseX={50} baseY={68} baseW={1300} baseH={880} />

            {/* minimalist glass strips, no text */}
            <GlassStrip index={0} x={32} y={40} w={620} h={260} />
            <GlassStrip index={1} x={68} y={48} w={540} h={240} />
            <GlassStrip index={2} x={50} y={67} w={700} h={260} />
        </AbsoluteFill>
    );
};
