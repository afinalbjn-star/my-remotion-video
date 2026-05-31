import React from 'react';
import { Composition } from 'remotion';
import { TechnologyScene } from './Scene';
import { LuxuryTechBackground, LOOP_DURATION } from './LuxuryTechBackground';
import { AnimatedBackground, VIDEO_CONFIG } from './AnimatedBackground';

const Main: React.FC = () => {
    return (
        <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '80px', fontFamily: 'sans-serif' }}>
            LEMBARAN BARU
        </div>
    );
};

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Main"
                component={Main}
                durationInFrames={120}
                fps={60}
                width={1920}
                height={1080}
            />

            {/* Registrasi untuk Shader Grid Neon */}
            <Composition
                id="TechnologyGrid"
                component={TechnologyScene}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            {/* Registrasi untuk Luxury Tech Background */}
            <Composition
                id="LuxuryBackground"
                component={LuxuryTechBackground}
                durationInFrames={LOOP_DURATION}
                fps={60}
                width={3840}
                height={2160}
            />

            {/* Registrasi untuk Animated Background */}
            <Composition
                id="AnimatedBackground"
                component={AnimatedBackground}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
        </>
    );
};