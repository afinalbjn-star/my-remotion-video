import React, { useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import {
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    interpolate,
} from 'remotion';
import * as THREE from 'three';

const GRID_SIZE = 40;
const CUBE_SIZE = 2;

const BackgroundCube: React.FC<{ x: number; z: number }> = ({ x, z }) => {
    // Variasi tinggi statis untuk tekstur landscape
    const height = useMemo(() => (Math.sin(x * 0.3) * Math.cos(z * 0.3)) * 0.8, [x, z]);

    return (
        <mesh position={[x * CUBE_SIZE, height, z * CUBE_SIZE]}>
            <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
            <meshStandardMaterial
                color="#1a1c20"
                roughness={0.9}
                metalness={0.2}
            />
        </mesh>
    );
};

export const TechDataFlow: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Animasi pergerakan garis diagonal (Seamless Loop)
    // Kita menggeser pola sejauh kelipatan ukuran pattern-nya
    const patternSize = 200;
    const moveProgress = (frame / durationInFrames);

    const lineX = moveProgress * patternSize * 2;
    const lineY = moveProgress * patternSize * 2;

    const cubes = useMemo(() => {
        const elements = [];
        for (let x = -GRID_SIZE / 2; x < GRID_SIZE / 2; x++) {
            for (let z = -GRID_SIZE / 2; z < GRID_SIZE / 2; z++) {
                elements.push(<BackgroundCube key={`${x}-${z}`} x={x} z={z} />);
            }
        }
        return elements;
    }, []);

    return (
        <AbsoluteFill style={{ backgroundColor: '#050505' }}>
            {/* Layer 1: Isometric Grid (Background) */}
            <ThreeCanvas width={width} height={height}>
                <orthographicCamera
                    makeDefault
                    left={-45}
                    right={45}
                    top={25}
                    bottom={-25}
                    near={0.1}
                    far={1000}
                    position={[50, 40, 40]}
                    lookAt={new THREE.Vector3(0, 0, 0)}
                />
                <ambientLight intensity={0.2} />
                <directionalLight position={[10, 20, 10]} intensity={0.5} />
                {/* Cahaya biru tipis yang memantul di grid */}
                <pointLight position={[0, 10, 0]} distance={50} intensity={2} color="#00f2ff" />

                <group rotation={[0, (frame / durationInFrames) * Math.PI * 2, 0]}>
                    {cubes}
                </group>
                <fog attach="fog" args={['#050505', 40, 120]} />
            </ThreeCanvas>

            {/* Layer 2: Shifting Diagonal Lines (Overlay SVG) */}
            <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
                <defs>
                    <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    <pattern
                        id="diagonalPattern"
                        width={patternSize}
                        height={patternSize}
                        patternUnits="userSpaceOnUse"
                        patternTransform={`translate(${lineX}, ${lineY})`}
                    >
                        {/* Garis Diagonal Utama */}
                        <line
                            x1="0" y1="0" x2={patternSize} y2={patternSize}
                            stroke="#00f2ff" strokeWidth="1" strokeOpacity="0.4"
                        />
                        {/* Garis Pendukung untuk kompleksitas visual */}
                        <line
                            x1={patternSize / 2} y1="0" x2={patternSize} y2={patternSize / 2}
                            stroke="#00f2ff" strokeWidth="0.5" strokeOpacity="0.2"
                        />
                        <line
                            x1="0" y1={patternSize / 2} x2={patternSize / 2} y2={patternSize}
                            stroke="#00f2ff" strokeWidth="0.5" strokeOpacity="0.2"
                        />
                    </pattern>
                </defs>

                {/* Background Pattern Mask */}
                <rect
                    width="100%"
                    height="100%"
                    fill="url(#diagonalPattern)"
                    filter="url(#cyanGlow)"
                />
            </svg>

            {/* Layer 3: Dynamic Glow Overlays */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 30% 30%, rgba(0, 242, 255, 0.05) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            {/* UI Decals (Optional but recommended for Tech vibe) */}
            <div style={{
                position: 'absolute',
                top: 60,
                right: 80,
                fontFamily: 'monospace',
                color: '#00f2ff',
                fontSize: 18,
                textAlign: 'right',
                opacity: 0.6,
                letterSpacing: '2px'
            }}>
                DATA_STREAM::FLOW_ACTIVE<br />
                LATENCY: 1.2ms<br />
                ENCRYPTION_LAYER: 07
            </div>
        </AbsoluteFill>
    );
};