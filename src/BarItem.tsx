import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface BarItemProps {
    label: string;
    value: number;
    maxValue: number;
    color: string;
    index: number;
}

export const BarItem: React.FC<BarItemProps> = ({ label, value, maxValue, color, index }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const widthProgress = spring({
        frame: frame - index * 5,
        fps,
        config: { stiffness: 60 },
    });

    const barWidth = interpolate(widthProgress, [0, 1], [0, (value / maxValue) * 100]);
    const displayValue = Math.round(interpolate(widthProgress, [0, 1], [0, value]));

    return (
        <div style={{ marginBottom: 20, width: '80%' }}>
            <div style={{
                color: 'white',
                fontSize: 24,
                fontFamily: 'sans-serif',
                marginBottom: 8,
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <span>{label}</span>
                <span style={{ fontWeight: 'bold' }}>{displayValue.toLocaleString()}M</span>
            </div>
            <div style={{
                width: '100%',
                height: 40,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: 20,
                    boxShadow: `0 0 20px ${color}66`,
                    transition: 'width 0.5s ease-out'
                }} />
            </div>
        </div>
    );
};