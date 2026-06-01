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
import { ChronoCosmicScene } from './ChronoCosmicScene';
import { IridescentSilk } from './IridescentSilk';
import { MoireMonolith } from './MoireMonolith';
import { SeamlessLoopBackground } from './SeamlessLoopBackground';
import { CelestialVortex } from './CelestialVortex';
import { CosmosLoop } from './CosmosLoop';
import { IsometricConveyor } from './IsometricConveyor';
import { CleanMinimalistIsometricGrid } from './CleanMinimalistIsometricGrid';
import { LiquidGradientMeshLoop } from './LiquidGradientMeshLoop';
import { CosmicRibbonWaveLoop } from './CosmicRibbonWaveLoop';
import { QuantumCyberSphereMatrix } from './QuantumCyberSphereMatrix';
import { AuroraEtherealSilkLoop } from './AuroraEtherealSilkLoop';
import { MinimalistBokehLoop } from './MinimalistBokehLoop';
import { AuroraEtherealSilkLoop as AuroraEtherealSilkV3Comp } from './AuroraEtherealSilkV3';
import LiquidGradientWaves from './LiquidGradientWaves';
import { MinimalistSearchBarUI } from './MinimalistSearchBarUI';
import { AbstractCorporateNetwork } from './AbstractCorporateNetwork';
import { GeometricallyPreciseHoneycomb } from './GeometricallyPreciseHoneycomb';

const Main: React.FC = () => {
    return (
        <AbsoluteFill>
            <GeometricallyPreciseHoneycomb />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '120px', fontFamily: 'sans-serif', color: 'white', fontWeight: 'bold', textShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
                LEMBARAN BARU
            </div>
        </AbsoluteFill>
    );
};

// Komponen Root yang mendaftarkan semua komposisi
export const RemotionRoot: React.FC = () => {
    // Debugging untuk mencari komponen yang undefined
    const components: Record<string, React.FC<any> | undefined> = {
        Main,
        TechnologyScene,
        LuxuryTechBackground,
        AnimatedBackground,
        TechBackground,
        AdvancedTechBackground,
        FuturisticBackground,
        CorporateAbstractBackground,
        CyberGridTunnel,
        GradientTechWaves,
        ComplexVoronoi,
        ChronoCosmicScene,
        IridescentSilk,
        MoireMonolith,
        SeamlessLoopBackground,
        CelestialVortex,
        CosmosLoop,
        IsometricConveyor,
        CleanMinimalistIsometricGrid,
        LiquidGradientMeshLoop,
        CosmicRibbonWaveLoop,
        QuantumCyberSphereMatrix,
        AuroraEtherealSilkLoop,
        MinimalistBokehLoop,
        AuroraEtherealSilkV3Comp, // This was already AuroraEtherealSilkV3Comp, no change needed here.
        LiquidGradientWaves,
        MinimalistSearchBarUI,
        AbstractCorporateNetwork,
        GeometricallyPreciseHoneycomb,
    };

    Object.entries(components).forEach(([name, comp]) => {
        if (!comp) console.error(`CRITICAL: Komponen "${name}" bernilai undefined! Periksa file sumbernya.`);
    });

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

            <Composition
                id="ChronoCosmicLattice"
                displayName="Chrono Cosmic Lattice"
                component={ChronoCosmicScene}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="SilkFlowScene"
                displayName="Iridescent Silk Flow"
                component={IridescentSilk}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="KineticMoireMonolith"
                displayName="Kinetic Moiré Monolith"
                component={MoireMonolith}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="SeamlessLoopBackground"
                displayName="Seamless Loop Background"
                component={SeamlessLoopBackground}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="CosmosLoop"
                displayName="Cosmos Galaxy Loop"
                component={CosmosLoop}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="CelestialVortex"
                displayName="Celestial Vortex"
                component={CelestialVortex}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="IsometricConveyor"
                displayName="Isometric Tech Conveyor"
                component={IsometricConveyor}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="CleanMinimalistIsometricGrid"
                displayName="Clean Minimalist Isometric Grid"
                component={CleanMinimalistIsometricGrid}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="LiquidGradientMeshLoop"
                displayName="Liquid Gradient Mesh Loop"
                component={LiquidGradientMeshLoop}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="CosmicRibbonWaveLoop"
                displayName="Cosmic Ribbon Wave Loop"
                component={CosmicRibbonWaveLoop}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="QuantumCyberSphereMatrix"
                displayName="Quantum Cyber Sphere Matrix"
                component={QuantumCyberSphereMatrix}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="AuroraEtherealSilkLoop"
                displayName="Aurora Ethereal Silk Loop"
                component={AuroraEtherealSilkLoop}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="MinimalistBokehLoop"
                displayName="Minimalist Bokeh Loop"
                component={MinimalistBokehLoop}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="AuroraEtherealSilkV3"
                displayName="Aurora Ethereal Silk V3"
                component={AuroraEtherealSilkV3Comp}
                durationInFrames={900}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="LiquidGradientWaves"
                displayName="Liquid Gradient Waves"
                component={LiquidGradientWaves}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="AbstractCorporateNetwork"
                displayName="Abstract Corporate Network"
                component={AbstractCorporateNetwork}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="MinimalistSearchBarUI"
                displayName="Minimalist Search Bar UI"
                component={MinimalistSearchBarUI}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />

            <Composition
                id="GeometricallyPreciseHoneycomb"
                displayName="Geometrically Precise Honeycomb"
                component={GeometricallyPreciseHoneycomb}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
        </>
    );
};