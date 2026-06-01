import React from 'react';
import { Composition, AbsoluteFill } from 'remotion';
import { TechnologyScene } from './Scene';
import { LuxuryTechBackground, LOOP_DURATION } from './LuxuryTechBackground';
import { AnimatedBackground, VIDEO_CONFIG } from './AnimatedBackground';
import { TechBackground } from './TechBackground';
import { AdvancedTechBackground } from './AdvancedTechBackground';
import { FuturisticBackground } from './FuturisticBackground';
import { CorporateAbstractBackground } from './CorporateAbstractBackground';
import { CyberGridTunnel } from './CyberGridTunnel';
import { GradientTechWaves } from './GradientTechWaves';
import { ComplexVoronoi } from './ComplexVoronoi';

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

// Komponen Root yang mendaftarkan semua komposisi
export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* Komposisi Utama */}
            <Composition
                id="Main"
                displayName="Main Video"
                component={Main}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />

            <Composition
                id="TechnologyGrid"
                displayName="Tech Shader Grid"
                component={TechnologyScene}
                durationInFrames={600}
                fps={VIDEO_CONFIG.fps}
                width={3840}
                height={2160}
            />

            <Composition
                id="LuxuryBackground"
                displayName="Luxury Tech Background"
                component={LuxuryTechBackground}
                durationInFrames={LOOP_DURATION}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="AnimatedBackground"
                displayName="Aurora Animated Background"
                component={AnimatedBackground}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />

            <Composition
                id="TechBackground"
                displayName="Standard Tech Background"
                component={TechBackground}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />

            <Composition
                id="AdvancedTechBackground"
                displayName="Advanced Particle Tech"
                component={AdvancedTechBackground}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />

            <Composition
                id="FuturisticBackground"
                displayName="Futuristic Glass Panels"
                component={FuturisticBackground}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />

            <Composition
                id="CorporateAbstractLoop"
                displayName="Corporate Abstract Background"
                component={CorporateAbstractBackground}
                durationInFrames={600}
                fps={VIDEO_CONFIG.fps}
                width={3840}
                height={2160}
            />

            <Composition
                id="CyberGridTunnel"
                displayName="Cyber Grid Tunnel"
                component={CyberGridTunnel}
                durationInFrames={600}
                fps={VIDEO_CONFIG.fps}
                width={3840}
                height={2160}
            />

            <Composition
                id="GradientTechWaves"
                displayName="Gradient Tech Waves"
                component={GradientTechWaves}
                durationInFrames={600}
                fps={VIDEO_CONFIG.fps}
                width={3840}
                height={2160}
            />

            <Composition
                id="ComplexVoronoi"
                displayName="Complex Voronoi Network"
                component={ComplexVoronoi}
                durationInFrames={600}
                fps={VIDEO_CONFIG.fps}
                width={3840}
                height={2160}
            />
        </>
    );
};