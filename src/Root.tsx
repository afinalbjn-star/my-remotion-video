import React from 'react';
import { Composition } from 'remotion';
import { KembangApi } from './KembangApi';
import PolygonalBackground from './PolygonalBackground'; // Import komponen baru

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
        </>
    );
};