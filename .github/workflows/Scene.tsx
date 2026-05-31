import React, { useMemo, useRef } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './Shaders';

export const MercuryScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const meshRef = useRef<THREE.Mesh>(null);

    // Menghitung waktu agar loop seamless (0 sampai 2*PI)
    const uTime = (frame / durationInFrames) * Math.PI * 2;

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
    }), []);

    uniforms.uTime.value = uTime;

    return (
        <ThreeCanvas width={3840} height={2160}>
            {/* Menambahkan background gelap agar logam terlihat kontras */}
            <color attach="background" args={['#020202']} />

            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />

            <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]}>
                <planeGeometry args={[15, 15, 256, 256]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    side={THREE.DoubleSide}
                    wireframe={false}
                />
            </mesh>

            {/* Depth of Field Camera Simulation */}
            <perspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        </ThreeCanvas>
    );
};