import React, { useRef, useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Shader kustom untuk menghasilkan miliaran bintang bercahaya (Glow Particles)
const CustomParticleShader = {
    vertexShader: `
		uniform float uTime;
		varying vec3 vColor;
		void main() {
			vColor = color;
			// Rumus rotasi spiral kosmos konstan
			float angle = uTime * (1.0 + length(position) * 0.1);
			vec3 rotatedPosition = position;
			rotatedPosition.x = position.x * cos(angle) - position.y * sin(angle);
			rotatedPosition.y = position.x * sin(angle) + position.y * cos(angle);
			
			vec4 mvPosition = modelViewMatrix * vec4(rotatedPosition, 1.0);
			gl_Position = projectionMatrix * mvPosition;
			
			// Efek ukuran berdasarkan jarak kamera (Depth of Field alami)
			gl_PointSize = (8.0 / -mvPosition.z) * (1.0 + sin(uTime + length(position)));
		}
	`,
    fragmentShader: `
		varying vec3 vColor;
		void main() {
			// Membuat partikel berbentuk lingkaran blur (tidak kotak) agar mirip stardust asli
			float dist = length(gl_PointCoord - vec3(0.5).xy);
			if (dist > 0.5) discard;
			float alpha = smoothstep(0.5, 0.1, dist);
			gl_FragColor = vec4(vColor, alpha * 0.8);
		}
	`
};

const CosmosParticles: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Hitung progress loop agar seamless (0 sampai 2*PI)
    const loopProgress = (frame / durationInFrames) * Math.PI * 2;

    // Update waktu shader di setiap frame Remotion
    if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = loopProgress;
    }

    // Membuat struktur galaksi spiral sesuai visual gambar
    const [positions, colors] = useMemo(() => {
        const count = 45000; // Jumlah partikel sangat padat
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);

        // Warna dari gambar: Inti putih, lengan cyan/turquoise, luar biru tua & ungu
        const colorCore = new THREE.Color("#ffffff");
        const colorCyan = new THREE.Color("#00f5d4");
        const colorBlue = new THREE.Color("#1e3f8a");
        const colorPurple = new THREE.Color("#5a189a");

        for (let i = 0; i < count; i++) {
            // Distribusi spiral Archimedes
            const r = Math.pow(Math.random(), 2.5) * 45; // Mengumpul padat di tengah
            const arms = (i % 3) * ((2 * Math.PI) / 3); // 3 lengan utama seperti gambar
            const theta = r * 0.4 + arms + (Math.random() - 0.5) * 0.4;

            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r;
            const z = (Math.random() - 0.5) * (r * 0.15); // Ketebalan piringan galaksi

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            // Pewarnaan gradasi berdasarkan jarak dari pusat (r)
            let finalColor = colorBlue;
            if (r < 3) {
                finalColor = colorCore; // Inti super terang
            } else if (r < 12) {
                finalColor = colorCyan; // Pendaran cyan dominan di tengah gambar
            } else if (r > 28 && Math.random() > 0.6) {
                finalColor = colorPurple; // Taburan debu ungu di tepi luar
            } else {
                // Campuran transisi biru ke cyan
                finalColor = colorBlue.clone().lerp(colorCyan, Math.random() * 0.5);
            }

            col[i * 3] = finalColor.r;
            col[i * 3 + 1] = finalColor.g;
            col[i * 3 + 2] = finalColor.b;
        }

        return [pos, col];
    }, []);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[colors, 3]}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={CustomParticleShader.vertexShader}
                fragmentShader={CustomParticleShader.fragmentShader}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending} // Membuat partikel yang bertumpuk menjadi sangat terang (Glow)
                vertexColors
                uniforms={{
                    uTime: { value: 0 }
                }}
            />
        </points>
    );
};

export const CelestialVortex: React.FC = () => {
    return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "#010206" }}>
            <Canvas
                // Kamera dibuat miring (Tilt 3D) melihat dari sudut atas galaksi sesuai gambar asli
                camera={{ position: [0, -32, 28], fov: 60 }}
                gl={{ antialias: true, powerPreference: "high-performance" }}
                onCreated={({ gl, camera }) => {
                    camera.lookAt(0, 0, 0); // Kamera mengunci titik tengah kosmos
                }}
            >
                <ambientLight intensity={0.5} />
                <CosmosParticles />
            </Canvas>
        </div>
    );
};