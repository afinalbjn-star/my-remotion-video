import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { FractalMaterial } from "./FractalMaterial";

export const ChronoCosmicScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // 1. Logika Seamless Loop Pergerakan Kamera 360 Derajat
    const totalProgress = frame / durationInFrames;
    const angle = totalProgress * Math.PI * 2;

    const radius = 5.0;
    const camX = Math.sin(angle) * radius;
    const camZ = Math.cos(angle) * radius;
    const camY = Math.sin(angle * 2) * 1.2;

    // 2. Generasi Struktur Garis Jaringan Saraf
    const particleCount = 2000;
    const lineIndices = useMemo(() => {
        const basePositions: [number, number, number][] = [];
        for (let i = 0; i < particleCount; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = Math.random() * 3.0 + 1.5;
            basePositions.push([
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            ]);
        }

        const indices: number[] = [];
        for (let i = 0; i < particleCount; i += 4) {
            const targets = basePositions
                .map((p, idx) => ({
                    idx,
                    dist: Math.hypot(p[0] - basePositions[i][0], p[1] - basePositions[i][1], p[2] - basePositions[i][2])
                }))
                .filter(item => item.idx !== i)
                .sort((a, b) => a.dist - b.dist);

            for (let j = 0; j < Math.min(3, targets.length); j++) {
                indices.push(i, targets[j].idx);
            }
        }
        return new Uint16Array(indices);
    }, []);

    // Animasi posisi partikel harmonis
    const dynamicPositions = useMemo(() => {
        const pArray = new Float32Array(particleCount * 3);
        const t = totalProgress * Math.PI * 2;
        let idx = 0;
        for (let i = 0; i < particleCount; i++) {
            const seed = i * 0.05;
            const offset = Math.sin(t + seed) * 0.2;
            const angleX = seed + Math.sin(t);
            const angleY = seed * 1.5 + Math.cos(t);
            pArray[idx++] = Math.sin(angleX) * (2.5 + offset);
            pArray[idx++] = Math.cos(angleY) * (2.5 + offset);
            pArray[idx++] = Math.sin(angleX + angleY) * (2.5 + offset);
        }
        return pArray;
    }, [totalProgress]);

    return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "#020205" }}>
            <ThreeCanvas
                width={width}
                height={height}
                camera={{ fov: 60, near: 0.1, far: 20.0, position: [camX, camY, camZ] }}
                onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
            >
                <ambientLight intensity={0.15} />
                <pointLight position={[0, 0, 0]} intensity={3.0} color="#8b5cf6" distance={10} />

                {/* Mandelbox Fractal Core */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[6, 6, 6]} />
                    <FractalMaterial progress={totalProgress} />
                </mesh>

                {/* Neural Network Points & Lines */}
                <points>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" args={[dynamicPositions, 3]} />
                    </bufferGeometry>
                    <pointsMaterial color="#06b6d4" size={0.035} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
                </points>

                <lineSegments>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" args={[dynamicPositions, 3]} />
                        <bufferAttribute attach="index" args={[lineIndices, 1]} />
                    </bufferGeometry>
                    <lineBasicMaterial
                        color="#6366f1"
                        transparent
                        opacity={0.25}
                        blending={THREE.AdditiveBlending}
                    />
                </lineSegments>
            </ThreeCanvas>
        </div>
    );
};