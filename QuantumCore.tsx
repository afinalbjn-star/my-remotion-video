import React, { useMemo, useRef } from 'react';
import { ThreeCanvas } from '@remotion/three';
import {
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    AbsoluteFill,
} from 'remotion';
import * as THREE from 'three';

const PARTICLE_COUNT = 5000;

const Core: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Seamless rotation math (2PI)
    const rotation = (frame / durationInFrames) * Math.PI * 2;

    return (
        <mesh rotation={[rotation, rotation, rotation * 0.5]}>
            <icosahedronGeometry args={[2, 4]} />
            <meshStandardMaterial
                wireframe
                color="#00d2ff"
                emissive="#00d2ff"
                emissiveIntensity={2}
            />
        </mesh>
    );
};

const OrbitalRings: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const rotationPhase = (frame / durationInFrames) * Math.PI * 2;

    return (
        <group>
            {[1, 2, 3].map((id) => {
                const speed = id * 0.5;
                const rot = rotationPhase * speed;
                // Flicker logic: 2 frames glitch
                const isGlitch = Math.random() > 0.98 && frame % 2 === 0;

                return (
                    <mesh
                        key={id}
                        rotation={[rot, rot * 0.5, 0]}
                        scale={isGlitch ? 1.05 : 1}
                    >
                        <torusGeometry args={[3 + id * 0.5, 0.02, 16, 100]} />
                        <meshBasicMaterial
                            color={id % 2 === 0 ? "#bc13fe" : "#00d2ff"}
                            transparent
                            opacity={isGlitch ? 0.2 : 0.6}
                        />
                    </mesh>
                );
            })}
        </group>
    );
};

const ParticleCloud: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Breathing effect (sinusoidal)
    const phase = (frame / durationInFrames) * Math.PI * 2;
    const breathScale = 1 + Math.sin(phase) * 0.15;

    const points = useMemo(() => {
        const coords = new Float32Array(PARTICLE_COUNT * 3);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const r = 5 + Math.random() * 5;
            const theta = Math.acos(2 * Math.random() - 1);
            const phi = Math.random() * Math.PI * 2;

            coords[i * 3] = r * Math.sin(theta) * Math.cos(phi);
            coords[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            coords[i * 3 + 2] = r * Math.cos(theta);
        }
        return coords;
    }, []);

    return (
        <points scale={[breathScale, breathScale, breathScale]}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={PARTICLE_COUNT}
                    array={points}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                color="#00d2ff"
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
};

export const QuantumCore: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, fps } = useVideoConfig();

    // Camera Zoom-in using spring
    const zoomProgress = spring({
        frame,
        fps,
        config: { stiffness: 10, damping: 20 },
    });
    const cameraZ = interpolate(zoomProgress, [0, 1], [20, 12]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#020005' }}>
            <ThreeCanvas width={width} height={height}>
                <perspectiveCamera
                    makeDefault
                    position={[0, 0, cameraZ]}
                    fov={45}
                />

                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#bc13fe" />
                <pointLight position={[-10, -10, -10]} intensity={1.5} color="#00d2ff" />

                <Core />
                <OrbitalRings />
                <ParticleCloud />

                {/* Fog for depth effect */}
                <fog attach="fog" args={['#020005', 10, 25]} />
            </ThreeCanvas>

            {/* Overlay UI elements */}
            <div style={{
                position: 'absolute',
                top: 80,
                left: 80,
                fontFamily: 'monospace',
                color: '#00d2ff',
                fontSize: 24,
                opacity: 0.8
            }}>
                <div style={{ fontSize: 40, fontWeight: 'bold', marginBottom: 10 }}>QUANTUM_CORE_v2.0</div>
                <div>STATUS: CORE_STABLE</div>
                <div>ENCRYPTION: ACTIVE [AES-512]</div>
                <div style={{
                    marginTop: 20,
                    width: 300,
                    height: 4,
                    background: 'rgba(0, 210, 255, 0.2)'
                }}>
                    <div style={{
                        width: `${(frame / 600) * 100}%`,
                        height: '100%',
                        background: '#00d2ff',
                        boxShadow: '0 0 10px #00d2ff'
                    }} />
                </div>
            </div>

            {/* Post-processing-like noise overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.05,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none',
            }} />

            {/* Vignette */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, transparent 30%, rgba(2,0,5,1) 100%)',
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};