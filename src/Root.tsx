import React from 'react';
import { Composition } from 'remotion';
import { KembangApi } from './KembangApi';
import PolygonalBackground from './PolygonalBackground'; // Import komponen baru
import NeonLinesBackground from './NeonLinesBackground'; // Import komponen baru
import { PlexusTunnel } from './PlexusTunnel';
import { FallingEyesBackground } from './FallingEyesBackground'; // Import komponen baru
import { SolarSystem } from './SolarSystem';
import { GiantEye } from './GiantEye';
import { RoyalChristmasBackground } from './RoyalChristmasBackground';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="KembangApi"
                component={KembangApi}
                durationInFrames={900} // 15 detik * 60 fps
                fps={60}
                width={3840} // 4K Resolution
                height={2160}
            />
            <Composition
                id="PolygonalBackground"
                component={PolygonalBackground}
                durationInFrames={600} // 10 detik * 60 fps
                fps={60}
                width={3840} // Resolusi 4K
                height={2160}
            />
            <Composition
                id="NeonLinesBackground"
                component={NeonLinesBackground}
                durationInFrames={900} // 15 detik * 60 fps
                fps={60}
                width={3840} // Resolusi 4K
                height={2160}
            />
            <Composition
                id="PlexusTunnel"
                component={PlexusTunnel}
                durationInFrames={600} // 10 detik * 60 fps
                fps={60}
                width={3840} // Resolusi 4K
                height={2160}
            />
            <Composition
                id="SolarSystem"
                component={SolarSystem}
                durationInFrames={900} // 15 detik * 60 fps
                fps={60}
                width={3840} // Resolusi 4K
                height={2160}
            />
            <Composition
                id="GiantEye"
                component={GiantEye}
                durationInFrames={600} // 10 detik * 60 fps
                fps={60}
                width={3840} // Resolusi 4K
                height={2160}
            />
            <Composition
                id="RoyalChristmasBackground"
                component={RoyalChristmasBackground}
                durationInFrames={600} // 10 detik * 60 fps
                fps={60}
                width={3840} // 4K Resolution
                height={2160}
            />
            <Composition
                id="FallingEyesBackground"
                component={FallingEyesBackground}
                durationInFrames={600} // 10 detik * 60 fps
                fps={60}
                width={3840} // Resolusi 4K
                height={2160}
            />
        </>
    );
};