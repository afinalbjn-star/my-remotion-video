import React from 'react';
import { Composition } from 'remotion';
import { DataMesh } from './DataMesh';
import { WinterSkyScene, VIDEO_CONFIG } from './WinterScene';
import SineWaveSilk from './SineWaveSilk'; // Menggunakan default import agar lebih stabil

// Komponen Root yang mendaftarkan semua komposisi
export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="DataMesh"
                component={DataMesh}
                durationInFrames={450} // 15 detik pada 30fps
                fps={30}
                width={1920}
                height={1080}
            />
            <Composition
                id="WinterSky"
                component={WinterSkyScene}
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
            <Composition
                id="SineWaveSilk"
                component={SineWaveSilk} // Ini akan mengambil SineWaveSilk dari file .tsx
                durationInFrames={VIDEO_CONFIG.durationInFrames}
                fps={VIDEO_CONFIG.fps}
                width={VIDEO_CONFIG.width}
                height={VIDEO_CONFIG.height}
            />
        </>
    );
};