import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, random } from 'remotion';

const NODE_COUNT = 80;
const CONNECTION_DISTANCE = 400; // Jarak maksimal untuk membuat garis

export const NeuralGrid: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Generate titik secara acak namun stabil
    const nodes = useMemo(() => {
        return new Array(NODE_COUNT).fill(0).map((_, i) => ({
            id: i,
            x: random(`x-${i}`) * width,
            y: random(`y-${i}`) * height,
            phase: random(`phase-${i}`) * Math.PI * 2,
            offset: random(`offset-${i}`) * 100 + 50,
            size: random(`size-${i}`) * 4 + 2,
            speed: random(`speed-${i}`) * 0.5 + 0.5,
        }));
    }, [width, height]);

    // Hitung posisi dinamis setiap node berdasarkan frame
    const dynamicNodes = nodes.map(node => {
        const t = (frame / durationInFrames) * Math.PI * 2;
        const x = node.x + Math.sin(t * node.speed + node.phase) * node.offset;
        const y = node.y + Math.cos(t * node.speed + node.phase) * node.offset;
        return { ...node, dx: x, dy: y };
    });

    return (
        <AbsoluteFill style={{ backgroundColor: '#02040a' }}>
            <svg width={width} height={height}>
                <defs>
                    <filter id="nodeGlow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00d2ff" stopOpacity="0" />
                        <stop offset="50%" stopColor="#00d2ff" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#00d2ff" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Render Lines (Koneksi antar node) */}
                {dynamicNodes.map((nodeA, i) => {
                    return dynamicNodes.slice(i + 1).map(nodeB => {
                        const dist = Math.sqrt(
                            Math.pow(nodeA.dx - nodeB.dx, 2) +
                            Math.pow(nodeA.dy - nodeB.dy, 2)
                        );

                        if (dist < CONNECTION_DISTANCE) {
                            const opacity = interpolate(
                                dist,
                                [0, CONNECTION_DISTANCE],
                                [0.6, 0]
                            );
                            return (
                                <line
                                    key={`${nodeA.id}-${nodeB.id}`}
                                    x1={nodeA.dx}
                                    y1={nodeA.dy}
                                    x2={nodeB.dx}
                                    y2={nodeB.dy}
                                    stroke="#00d2ff"
                                    strokeWidth={2}
                                    strokeOpacity={opacity}
                                />
                            );
                        }
                        return null;
                    });
                })}

                {/* Render Nodes (Titik) */}
                {dynamicNodes.map(node => (
                    <circle
                        key={node.id}
                        cx={node.dx}
                        cy={node.dy}
                        r={node.size}
                        fill="#fff"
                        style={{ filter: 'url(#nodeGlow)' }}
                    />
                ))}
            </svg>

            {/* Overlay Grid subtle untuk menambah kesan teknis */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    linear-gradient(to right, rgba(0, 210, 255, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0, 210, 255, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '100px 100px',
                pointerEvents: 'none'
            }} />
        </AbsoluteFill>
    );
};