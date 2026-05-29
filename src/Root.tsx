import React from 'react';
import { Composition } from 'remotion';
import { NeonTunnel } from './NeonTunnel';

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
        </>
    );
};