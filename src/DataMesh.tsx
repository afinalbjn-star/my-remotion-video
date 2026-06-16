import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { noise2D } from '@remotion/noise';

const POINTS_COUNT = 45;
const CONNECT_DISTANCE = 350;
const BG_COLOR = '#0d0f12';
const ACCENT_COLOR = '#00f2fe';

export const DataMesh: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Generate stable base positions for the nodes
    const points = useMemo(() => {
        return Array.from({ length: POINTS_COUNT }).map((_, i) => ({
            x: Math.random() * width,
            y: Math.random() * height,
            seed: i,
            speed: 0.2 + Math.random() * 0.5,
        }));
    }, [width, height]);

    // Calculate looping noise movement
    // We move in a circle within the noise field to return to the start point
    const getMovement = (seed: number, frame: number) => {
        const angle = (frame / durationInFrames) * Math.PI * 2;
        const radius = 0.6; // Speed/magnitude of the "warp"
        const dx = noise2D(seed, radius * Math.cos(angle), radius * Math.sin(angle));
        const dy = noise2D(seed + 100, radius * Math.cos(angle), radius * Math.sin(angle));
        return { x: dx * 120, y: dy * 120 };
    };

    const currentPoints = points.map((p) => {
        const offset = getMovement(p.seed, frame);
        return {
            x: p.x + offset.x,
            y: p.y + offset.y,
        };
    });

    return (
        <AbsoluteFill style={{ backgroundColor: BG_COLOR }}>
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={{ filter: 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.15))' }}
            >
                {/* Drawing connections (lines) */}
                {currentPoints.map((p1, i) =>
                    currentPoints.slice(i + 1).map((p2, j) => {
                        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                        if (dist < CONNECT_DISTANCE) {
                            const opacity = (1 - dist / CONNECT_DISTANCE) * 0.25;
                            return (
                                <line
                                    key={`${i}-${j}`}
                                    x1={p1.x}
                                    y1={p1.y}
                                    x2={p2.x}
                                    y2={p2.y}
                                    stroke={ACCENT_COLOR}
                                    strokeWidth={1}
                                    strokeOpacity={opacity}
                                />
                            );
                        }
                        return null;
                    })
                )}

                {/* Drawing nodes (dots) */}
                {currentPoints.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={2}
                        fill={ACCENT_COLOR}
                        fillOpacity={0.4}
                    />
                ))}
            </svg>
        </AbsoluteFill>
    );
};