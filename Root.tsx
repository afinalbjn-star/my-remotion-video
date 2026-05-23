import React from 'react';
import { Composition } from 'remotion';
import { BloodStream } from './BloodCells';
import { CyberFlow } from './src/CyberFlow';
import { SimpleVideo } from './src/SimpleVideo';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="BloodStream-4K"
                component={BloodStream}
                durationInFrames={600} // 10 detik * 60 fps
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="CyberFlow-4K"
                component={CyberFlow}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="SimpleVideo"
                component={SimpleVideo}
                durationInFrames={360}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
