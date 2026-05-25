import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const Main: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(frame, [0, 30], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const scale = spring({
        frame,
        fps,
        config: {
            stiffness: 100,
        },
    });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#0f172a',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <div style={{ fontSize: 120, opacity, transform: `scale(${scale})`, color: '#f8fafc', fontWeight: '900', fontFamily: 'system-ui' }}>LEMBARAN BARU</div>
        </AbsoluteFill>
    );
};