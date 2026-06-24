// path: src\Root.tsx

import React from 'react';
import { Composition } from 'remotion';
import { DataMesh } from './DataMesh';
import { WinterSkyScene, VIDEO_CONFIG as WinterSkyConfig } from './WinterScene';
import RiverFlow, { VIDEO_CONFIG as RiverFlowConfig } from './RiverFlow';
import RainbowLake, { VIDEO_CONFIG as RainbowLakeConfig } from './RainbowLake';
import SineWaveSilk from './SineWaveSilk';
import { TechBackground } from './TechBackground';
import { TechBackgroundComplex } from './TechBackgroundComplex';
import TechNexus from './TechNexus';
import MyVideo from './MyVideo'; // Impor komponen MyVideo
import DarkWaves from './DarkWaves';
import LakeSurface from './LakeSurface';
import BioluminescentDeep from './BioluminescentDeep';
import { CinematicWave } from './CinematicWave';
import InkBillow from './InkBillow';
import SilkWave from './SilkWave';
import { LiquidMetal } from './LiquidMetal';
import { AuroraBorealis } from './AuroraBorealis';
import { CosmicNebula } from './CosmicNebula';
import { CrystalRain } from './CrystalRain';
import { PlasmaWave } from './PlasmaWave';
import { DeepOcean } from './DeepOcean';
import { StarField } from './StarField';
import { MysticForest } from './MysticForest';
import { VolcanicGlass } from './VolcanicGlass';
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
                id="RainbowLake"
                component={RainbowLake}
                durationInFrames={RainbowLakeConfig.durationInFrames}
                fps={RainbowLakeConfig.fps}
                width={RainbowLakeConfig.width}
                height={RainbowLakeConfig.height}
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
                id="TechNexus"
                component={TechNexus}
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
            <Composition
                id="DarkWaves"
                component={DarkWaves}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="LakeSurface"
                component={LakeSurface}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="BioluminescentDeep"
                component={BioluminescentDeep}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="CinematicWave"
                component={CinematicWave}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="InkBillow"
                component={InkBillow}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="SilkWave"
                component={SilkWave}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="LiquidMetal"
                component={LiquidMetal}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="AuroraBorealis"
                component={AuroraBorealis}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="CosmicNebula"
                component={CosmicNebula}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="CrystalRain"
                component={CrystalRain}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="PlasmaWave"
                component={PlasmaWave}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="DeepOcean"
                component={DeepOcean}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="StarField"
                component={StarField}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="MysticForest"
                component={MysticForest}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="VolcanicGlass"
                component={VolcanicGlass}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
        </>
    );
};
