import React from 'react';
import { Composition } from 'remotion';
import { PastelLoading } from './PastelLoading';
import { InfinitePuzzleZoom } from './InfinitePuzzleZoom';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="PastelLoading"
                component={PastelLoading}
                durationInFrames={900} // 15 detik * 60 fps
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="InfinitePuzzleZoom"
                component={InfinitePuzzleZoom}
                durationInFrames={600} // 10 detik * 60 fps
                fps={60}
                width={3840}
                height={2160}
            />
        </>
    );
};