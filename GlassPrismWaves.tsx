import React, { useMemo, useRef } from 'react';
import { ThreeCanvas } from '@remotion/three';
import {
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    interpolate,
} from 'remotion';
import * as THREE from 'three';

const RIBBON_COUNT = 8;

const GlassRibbon: React.FC<{ index: number; color: string }> = ({ index, color }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const meshRef = useRef<THREE.Mesh>(null);

    // Seamless Loop Phase (0 to 2PI)
    const phase = (frame / durationInFrames) * Math.PI * 2;

    // Membuat geometri pita yang melengkung secara organik
    const geometry = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-15, -0.5);
        shape.lineTo(15, -0.5);
        shape.lineTo(15, 0.5);
        shape.lineTo(-15, 0.5);
        shape.closePath();

        return new THREE.ExtrudeGeometry(shape, {
            steps: 200,
            depth: 0.1,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
        });
    }, []);

    // Animasi pergerakan gelombang
    const yOffset = Math.sin(phase + index * 0.8) * 1.5;
    const rotationZ = Math.cos(phase * 0.5 + index) * 0.1;

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            position={[0, yOffset, -index * 1.5]}
            rotation={[Math.PI / 2.5, 0, rotationZ]}
        >
            <meshPhysicalMaterial
                transmission={1}
                thickness={0.8}
                roughness={0.05}
                metalness={0.1}
                clearcoat={1}
                clearcoatRoughness={0.1}
                color={color}
                ior={1.45} // Index of Refraction untuk kaca
                attenuationColor="#ffffff"
                attenuationDistance={1}
                iridescence={0.8}
                iridescenceIOR={1.7}
                iridescenceThicknessRange={[100, 400]}
                transparent
                opacity={0.9}
            />
        </mesh>
    );
};

export const GlassPrismWaves: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const phase = (frame / durationInFrames) * Math.PI * 2;

    // Pencahayaan dinamis untuk efek spektrum pelangi di tepian
    const lightIntensity = interpolate(
        Math.sin(phase),
        [-1, 1],
        [1.5, 2.5]
    );

    return (
        <AbsoluteFill style={{ backgroundColor: '#050505' }}>
            <ThreeCanvas width={width} height={height}>
                <perspectiveCamera
                    makeDefault
                    position={[0, 2, 12]}
                    fov={35}
                />

                {/* Studio Lighting Setup */}
                <ambientLight intensity={0.2} />
                <pointLight
                    position={[10, 10, 10]}
                    intensity={lightIntensity}
                    color="#ffffff"
                />
                <spotLight
                    position={[-10, 10, 5]}
                    angle={0.15}
                    penumbra={1}
                    intensity={3}
                    color="#00d2ff" // Refleksi biru dingin
                />
                <spotLight
                    position={[10, -5, 5]}
                    angle={0.3}
                    penumbra={1}
                    intensity={2}
                    color="#ff00cc" // Refleksi prismatik pink
                />

                <group position={[0, 0, 0]}>
                    {[...Array(RIBBON_COUNT)].map((_, i) => (
                        <GlassRibbon
                            key={i}
                            index={i}
                            color={i % 2 === 0 ? "#e0e0e0" : "#ffffff"}
                        />
                    ))}
                </group>

                <fog attach="fog" args={['#050505', 5, 25]} />
            </ThreeCanvas>

            {/* Overlay Gradient untuk memperdalam kontras Charcoal */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.4) 100%)',
                pointerEvents: 'none'
            }} />

            {/* Subtle Grain Overlay untuk Kualitas 4K Organik */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none'
            }} />

            {/* Branding/Minimalist Label */}
            <div style={{
                position: 'absolute',
                bottom: 60,
                right: 80,
                fontFamily: 'system-ui, sans-serif',
                color: 'white',
                fontSize: 20,
                letterSpacing: '0.5em',
                opacity: 0.4
            }}>
                ETHEREAL_PRISM_v1
            </div>
        </AbsoluteFill>
    );
};