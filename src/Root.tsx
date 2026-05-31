import React from 'react';
import { registerRoot, Composition, AbsoluteFill } from 'remotion';
import { TechnologyScene } from './Scene';
import { LuxuryTechBackground, LOOP_DURATION } from './LuxuryTechBackground';
import { AnimatedBackground, VIDEO_CONFIG } from './AnimatedBackground';
import { TechBackground } from './TechBackground';
import { AdvancedTechBackground } from './AdvancedTechBackground';
import { FuturisticBackground } from './FuturisticBackground';
import { CorporateAbstractBackground } from './CorporateAbstractBackground';
import { CyberGridTunnel } from './CyberGridTunnel';

const Main: React.FC = () => {
    return (
        <AbsoluteFill>
            <AnimatedBackground />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '120px', fontFamily: 'sans-serif', color: 'white', fontWeight: 'bold', textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                LEMBARAN BARU
            </div>
        </AbsoluteFill>
    );
};

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Main"
                component={Main}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
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

            {/* Registrasi untuk Tech Background */}
            <Composition
                id="TechBackground"
                component={TechBackground}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />

            <Composition
                id="AdvancedTechBackground"
                component={AdvancedTechBackground}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />

            <Composition
                id="FuturisticBackground"
                component={FuturisticBackground}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />

            <Composition
                id="CorporateAbstractLoop"
                component={CorporateAbstractBackground}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="CyberGridTunnel"
                component={CyberGridTunnel}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
        </>
    );
};