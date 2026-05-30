import React, { useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import {
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    interpolate,
} from 'remotion';
import * as THREE from 'three';

const GRID_SIZE = 50; // Ukuran grid diperbesar untuk memastikan full layar
const CUBE_SIZE = 2;   // Ukuran satu kubus

const Cube: React.FC<{ x: number; z: number }> = ({ x, z }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Progress 0 ke 2PI untuk loop sempurna
    const phase = (frame / durationInFrames) * Math.PI * 2;

    // Logika "Bergantian" (Checkerboard)
    // f(x, z) = f(x-1, z+1) agar tetap seamless saat grid bergeser
    const isEven = (x + z) % 2 === 0;
    const direction = isEven ? 1 : -1;

    // Kombinasi gelombang untuk efek "Acak" namun tetap sinkron dengan loop
    const bounce = Math.sin(phase) * 1.2 * direction;
    const randomWave = Math.sin(phase * 2 + (x + z) * 0.5) * 0.4;
    const yOffset = bounce + randomWave;

    return (
        <mesh position={[x * CUBE_SIZE, yOffset, z * CUBE_SIZE]}>
            <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
            <meshStandardMaterial
                color="#e0e0e0"
                roughness={0.8}
                metalness={0.1}
            />
        </mesh>
    );
};

export const IsometricCubeGrid: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Animasi pergerakan untuk Seamless Loop
    // Kita menggeser seluruh grid sejauh satu unit kubus (CUBE_SIZE)
    // Dalam isometrik, pergerakan diagonal pada X dan Z akan menciptakan loop sempurna
    const offset = interpolate(
        frame,
        [0, durationInFrames],
        [0, CUBE_SIZE]
    );

    const cubes = useMemo(() => {
        const elements = [];
        for (let x = -GRID_SIZE / 2; x < GRID_SIZE / 2; x++) {
            for (let z = -GRID_SIZE / 2; z < GRID_SIZE / 2; z++) {
                elements.push(
                    <Cube
                        key={`${x}-${z}`}
                        x={x}
                        z={z}
                    />
                );
            }
        }
        return elements;
    }, []);

    return (
        <AbsoluteFill style={{ backgroundColor: '#f0f0f0' }}>
            <ThreeCanvas width={width} height={height}>
                {/* Kamera Ortografik untuk tampilan Isometrik Sempurna */}
                <orthographicCamera
                    makeDefault
                    left={-45}
                    right={45}
                    top={25}
                    bottom={-25}
                    near={0.1}
                    far={1000}
                    position={[60, 40, 30]} // Kamera diletakkan lebih ke samping dan tinggi
                    lookAt={new THREE.Vector3(0, 0, 0)}
                />

                {/* Pencahayaan Studio yang lembut */}
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1.2}
                    castShadow
                />
                <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ffffff" />

                {/* Group yang dianimasikan secara linear untuk looping */}
                <group position={[offset - 20, 0, -offset]}>
                    {cubes}
                </group>

                <fog attach="fog" args={['#f0f0f0', 40, 100]} />
            </ThreeCanvas>

            {/* Efek Blur Sebagian (Top & Bottom) untuk mensimulasikan Depth of Field */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '30%',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                maskImage: 'linear-gradient(to bottom, black, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
                pointerEvents: 'none',
                zIndex: 10,
            }} />

            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '30%',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                maskImage: 'linear-gradient(to top, black, transparent)',
                WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
                pointerEvents: 'none',
                zIndex: 10,
            }} />

            {/* Overlay untuk memperhalus bayangan (Ambient Occlusion palsu) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.05) 100%)',
                pointerEvents: 'none'
            }} />
        </AbsoluteFill>
    );
};