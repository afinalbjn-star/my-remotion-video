import React from 'react';
import { Composition } from 'remotion';
import { NeonTunnel } from './NeonTunnel';
import { LiquidWaves } from './LiquidWaves';
import { NeuralGrid } from './NeuralGrid';
import { FlowFields } from './FlowFields';
import { FinancialDashboard } from '../FinancialDashboard';
import { QuantumCore } from '../QuantumCore';
import { GlassPrismWaves } from '../GlassPrismWaves';
import { MinimalistGrid } from '../MinimalistGrid';
import { IsometricCubeGrid } from '../IsometricCubeGrid';
import { TechDataFlow } from '../TechDataFlow';

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
                durationInFrames={150}
                fps={30}
                width={1920}
                height={1080}
            />
            <Composition
                id="NeonTunnel"
                component={NeonTunnel}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="LiquidWaves"
                component={LiquidWaves}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="NeuralGrid"
                component={NeuralGrid}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="FlowFields"
                component={FlowFields}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="FinancialDashboard"
                component={FinancialDashboard}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="QuantumCore"
                component={QuantumCore}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="GlassPrismWaves"
                component={GlassPrismWaves}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="MinimalistGrid"
                component={MinimalistGrid}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="IsometricCubeGrid"
                component={IsometricCubeGrid}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
            <Composition
                id="TechDataFlow"
                component={TechDataFlow}
                durationInFrames={600}
                fps={60}
                width={3840}
                height={2160}
            />
        </>
    );
};