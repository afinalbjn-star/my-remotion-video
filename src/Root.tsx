import React from 'react';
import { Composition, Series } from 'remotion';
import { SnowfallSky } from './SnowfallSky';
import { BloodStream } from '../BloodCells';
import { CyberFlow } from './CyberFlow';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* 1. Master Composition: Gabungan Semua Dunia dalam satu Sequence */}
            <Composition
                id="MasterBackgroundShowcase"
                width={3840}
                height={2160}
                fps={60}
                durationInFrames={1140} // Dikurangi 60 frame dari Hyperframes
                component={() => (
                    <Series>
                        <Series.Sequence durationInFrames={400}>
                            <BloodStream />
                        </Series.Sequence>
                        <Series.Sequence durationInFrames={400}>
                            <CyberFlow />
                        </Series.Sequence>
                        <Series.Sequence durationInFrames={340}>
                            <SnowfallSky />
                        </Series.Sequence>
                    </Series>
                )}
            />

            {/* 2. Komposisi Individual untuk Rendering Loop Aset */}
            <Composition
                id="BloodStream-4K"
                component={BloodStream}
                durationInFrames={600}
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
                id="SnowfallSky-4K"
                component={SnowfallSky}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
        </>
    );
};