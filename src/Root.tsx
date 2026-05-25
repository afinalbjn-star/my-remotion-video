import React from 'react';
import { Composition } from 'remotion';
import { PastelLoading } from './PastelLoading';
import { InfinitePuzzleZoom } from './InfinitePuzzleZoom';
import { FloatingGeometricDepth } from './FloatingGeometricDepth';
import { GlassmorphicFlow } from './GlassmorphicFlow'; // Pastikan file bernama GlassmorphicFlow.tsx
import { GenerativeLiquidWaves } from './GenerativeLiquidWaves';
import { BloodCellFlow } from './BloodCellFlow';
import { OceanWaves } from './OceanWaves';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="PastelLoading"
                component={PastelLoading}
                durationInFrames={900} // 15 detik * 60 fps
                fps={60}
                width={1920}
                height={1080}
            />
            <Composition
                id="InfinitePuzzleZoom"
                component={InfinitePuzzleZoom}
                durationInFrames={600} // 10 detik * 60 fps
                fps={60}
                width={1920}
                height={1080}
            />
            <Composition
                id="FloatingGeometricDepth"
                component={FloatingGeometricDepth}
                durationInFrames={600} // 10 detik
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="GlassmorphicFlow"
                component={GlassmorphicFlow}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="GenerativeLiquidWaves"
                component={GenerativeLiquidWaves}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="BloodCellFlow"
                component={BloodCellFlow}
                durationInFrames={600} // 10 detik @ 60fps
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="OceanWaves"
                component={OceanWaves}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
        </>
    );
};