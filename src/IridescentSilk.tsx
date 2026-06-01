import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SilkMaterial } from "./SilkMaterial";

export const IridescentSilk: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Progress dari 0.0 ke 1.0 untuk menggerakkan poros waktu 4D
    const progress = frame / durationInFrames;

    return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "#000" }}>
            <ThreeCanvas
                width={width}
                height={height}
                orthographic
                camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 1000 }}
            >
                <mesh>
                    <planeGeometry args={[width, height]} />
                    <SilkMaterial progress={progress} resolution={[width, height]} />
                </mesh>
            </ThreeCanvas>
        </div>
    );
};