import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';
import './NeuralGridLoop.css';

const ROWS = 55; // Increased density
const COLS = 55;
const VIEW_SIZE = 2500;

export const NeuralGridLoop: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Wave parameters for organic "Deep Sea" look
    const getWaveZ = (r: number, c: number, f: number) => {
        const time = f * 0.04;
        const x = c * 0.15;
        const y = r * 0.15;

        // Layered waves (simulating ocean ripples)
        let z = Math.sin(x + time) * 30;
        z += Math.cos(y * 1.2 - time * 0.8) * 25;
        z += Math.sin((x + y) * 0.5 + time * 0.5) * 20;
        z += Math.sin(x * 2.5 - time * 1.2) * 8; // Small ripples
        z += Math.cos(y * 3.0 + time * 1.5) * 5;
        
        return z;
    };

    // Calculate all vertex positions
    const vertices = useMemo(() => {
        const grid = [];
        for (let r = 0; r <= ROWS; r++) {
            const row = [];
            for (let c = 0; c <= COLS; c++) {
                const x = (c / COLS) * VIEW_SIZE;
                const y = (r / ROWS) * VIEW_SIZE;
                const z = getWaveZ(r, c, frame);
                
                row.push({ x, y: y + z, z });
            }
            grid.push(row);
        }
        return grid;
    }, [frame]);

    // Path generation (optimized)
    const paths = useMemo(() => {
        const h = vertices.map(row => `M ${row.map(v => `${v.x},${v.y}`).join(' L ')}`);
        const v = [];
        for (let c = 0; c <= COLS; c++) {
            let path = `M ${vertices[0][c].x},${vertices[0][c].y}`;
            for (let r = 1; r <= ROWS; r++) {
                path += ` L ${vertices[r][c].x},${vertices[r][c].y}`;
            }
            v.push(path);
        }
        return [...h, ...v];
    }, [vertices]);

    return (
        <AbsoluteFill className="neural-grid-container">
            <div className="light-source" />
            
            <div className="grid-floor">
                <svg viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`} className="wave-svg">
                    {paths.map((d, i) => (
                        <path 
                            key={i} 
                            d={d} 
                            className="grid-line" 
                            style={{
                                // Dynamic opacity based on "distance" (row index)
                                opacity: interpolate(i % (ROWS + 1), [0, ROWS], [0.6, 0.1])
                            }}
                        />
                    ))}
                </svg>

                {/* Nodes at every intersection, with Depth of Field */}
                {vertices.map((row, r) => r % 1 === 0 && row.map((v, c) => c % 1 === 0 && (
                    <div
                        key={`${r}-${c}`}
                        className="grid-node-mesh"
                        style={{
                            left: `${(v.x / VIEW_SIZE) * 100}%`,
                            top: `${(v.y / VIEW_SIZE) * 100}%`,
                            // Depth of Field effects
                            opacity: interpolate(r, [0, ROWS], [0.9, 0.1]),
                            scale: String(interpolate(r, [0, ROWS], [1, 0.3])),
                            filter: `blur(${interpolate(r, [0, ROWS], [0, 4])}px)`,
                            // Subtle pulsing
                            boxShadow: `0 0 ${interpolate(v.z, [-50, 50], [5, 15])}px #00f2ff`,
                            backgroundColor: interpolate(v.z, [-30, 30], [0, 1]) > 0.5 ? '#fff' : '#00f2ff'
                        }}
                    />
                )))}
            </div>

            <div className="glow-line" />
            
            {/* Title removed to match the reference image's cleaner look */}
        </AbsoluteFill>
    );
};
