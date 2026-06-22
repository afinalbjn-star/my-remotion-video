// path: src\Root.tsx

import React from 'react';
import { Composition } from 'remotion';
import { DataMesh } from './DataMesh';
import { WinterSkyScene, VIDEO_CONFIG as WinterSkyConfig } from './WinterScene';
import RiverFlow, { VIDEO_CONFIG as RiverFlowConfig } from './RiverFlow';
import SineWaveSilk from './SineWaveSilk';
import { TechBackground } from './TechBackground';
import { TechBackgroundComplex } from './TechBackgroundComplex';
import MyVideo from './MyVideo'; // Impor komponen MyVideo
import { VIDEO_CONFIG } from './index'; // VIDEO_CONFIG dari index untuk komposisi lain

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="DataMesh"
                component={DataMesh}
                durationInFrames={450} // 15 detik pada 30fps
                fps={30}
                width={1920}
                height={1080}
            />
            <Composition
                id="WinterSky"
                component={WinterSkyScene}
                durationInFrames={WinterSkyConfig.durationInFrames}
                fps={WinterSkyConfig.fps}
                width={WinterSkyConfig.width}
                height={WinterSkyConfig.height}
            />
            <Composition
                id="RiverFlow"
                component={RiverFlow}
                durationInFrames={RiverFlowConfig.durationInFrames}
                fps={RiverFlowConfig.fps}
                width={RiverFlowConfig.width}
                height={RiverFlowConfig.height}
            />
            <Composition
                id="SineWaveSilk"
                component={SineWaveSilk}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="TechBackground"
                component={TechBackground}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="TechBackgroundComplex"
                component={TechBackgroundComplex}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="MyVideo"
                component={MyVideo}
                durationInFrames={VIDEO_CONFIG.durationInFrames} // 10 detik pada 60fps
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
        </>
    );
};
