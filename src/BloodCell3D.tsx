import React, { useMemo, useRef } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { EffectComposer, DepthOfField } from '@react-three/postprocessing';
import { Instance, Instances } from '@react-three/drei';

const CELL_COUNT = 150;

// Geometri Sel Darah Merah (Biconcave Disk)
const createBloodCellGeometry = () => {
    const points = [];
    const segments = 25;
    // Top half
    for (let i = 0; i <= segments; i++) {
        const x = i / segments;
        // Evans and Fung approximation for RBC cross section
        const y = 0.25 * Math.sqrt(1 - x * x) * (0.5 + 2 * x * x - Math.pow(x, 4));
        points.push(new THREE.Vector2(x, y));
    }
    // Bottom half
    for (let i = segments; i >= 0; i--) {
        const x = i / segments;
        const y = -0.25 * Math.sqrt(1 - x * x) * (0.5 + 2 * x * x - Math.pow(x, 4));
        points.push(new THREE.Vector2(x, y));
    }
    // Lathe revolves around Y axis
    const geometry = new THREE.LatheGeometry(points, 32);
    // Scale up
    geometry.scale(1.5, 1.5, 1.5);
    // Rotate so it lays flat instead of standing up
    geometry.rotateX(Math.PI / 2);
    return geometry;
};

const geometry = createBloodCellGeometry();

// Material dengan Subsurface Scattering (menggunakan transmission/thickness)
const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#990000'),
    emissive: new THREE.Color('#220000'),
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
    transmission: 0.6, // Glass-like transmission for subsurface effect
    thickness: 1.5, // Volume thickness for light scattering
    ior: 1.4,
});

const CellInstance: React.FC<{
    seed: number;
}> = ({ seed }) => {
    const ref = useRef<THREE.Group>(null);
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Random properties per cell based on seed
    const rX = useMemo(() => (Math.sin(seed * 12.34) - 0.5) * 20, [seed]);
    const rY = useMemo(() => (Math.cos(seed * 45.67) - 0.5) * 15, [seed]);
    const rZ = useMemo(() => (Math.sin(seed * 89.12) - 0.5) * 60, [seed]); // Z spread
    
    const rotSpeedX = useMemo(() => (Math.sin(seed) * 0.02), [seed]);
    const rotSpeedY = useMemo(() => (Math.cos(seed) * 0.02), [seed]);

    // Calculate Z movement loop
    const flowSpeed = 20; // How much distance covered in full duration
    const zOffset = (frame / durationInFrames) * flowSpeed;
    
    // Smooth looping using modulo against the total spread (60)
    let currentZ = (rZ + zOffset) % 60;
    // Shift back to range [-30, 30]
    if (currentZ > 30) currentZ -= 60;

    if (ref.current) {
        ref.current.position.set(rX, rY, currentZ);
        ref.current.rotation.x = seed + frame * rotSpeedX;
        ref.current.rotation.y = seed * 2 + frame * rotSpeedY;
    }

    return (
        <group ref={ref}>
            <Instance />
        </group>
    );
};

export const BloodStream3D: React.FC = () => {
    const { width, height } = useVideoConfig();

    return (
        <ThreeCanvas
            width={width}
            height={height}
            camera={{ position: [0, 0, 15], fov: 45 }}
            style={{ backgroundColor: '#0a0000' }}
        >
            <ambientLight intensity={0.4} color="#ffcccc" />
            
            <directionalLight 
                position={[10, 10, 5]} 
                intensity={1.5} 
                color="#ffcccc" 
            />
            <directionalLight 
                position={[-10, -10, -5]} 
                intensity={0.5} 
                color="#aa0000" 
            />
            
            {/* Soft inner tube light to simulate capillary walls */}
            <pointLight position={[0, 0, 0]} intensity={2} distance={30} color="#ff3333" />
            <pointLight position={[0, 0, -20]} intensity={2} distance={30} color="#ff3333" />
            <pointLight position={[0, 0, 20]} intensity={2} distance={30} color="#ff3333" />

            <Instances geometry={geometry} material={material} limit={CELL_COUNT}>
                {new Array(CELL_COUNT).fill(0).map((_, i) => (
                    <CellInstance key={i} seed={i} />
                ))}
            </Instances>

            <EffectComposer multisampling={4}>
                <DepthOfField
                    focusDistance={0.02} // where to focus
                    focalLength={0.05} // focal length
                    bokehScale={8} // bokeh size
                />
            </EffectComposer>
        </ThreeCanvas>
    );
};
