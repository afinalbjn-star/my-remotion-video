import React from 'react';
import { Composition } from 'remotion';
import { PastelLoading } from './PastelLoading';

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
        </>
    );
};