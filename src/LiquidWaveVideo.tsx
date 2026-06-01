import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import { WaveBackground } from './WaveBackground';
import { LiquidFilter } from './LiquidFilter';
import { CompProps } from './index';

export const LiquidWaveVideo: React.FC<CompProps> = ({
    titleText,
    titleColor,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Animasi masuk untuk teks menggunakan fungsi spring Remotion
    const textEntrance = spring({
        frame,
        fps,
        config: {
            damping: 12,
            mass: 0.5,
        },
    });

    // Masukkan file gambar Anda ke dalam folder 'public/image_c5abdf.jpg'
    const imageAsset = staticFile('image_c5abdf.jpg');
    const filterId = 'liquid-wave-filter';

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            {/* Global SVG Filter Component */}
            <LiquidFilter
                baseFrequencyX={0.01}
                baseFrequencyY={0.02}
                numOctaves={2}
                scale={60} // Intensitas gelombang cair, semakin tinggi semakin terdistorsi
                seed={5}
            />

            {/* Background dengan gambar terdistorsi */}
            <WaveBackground imageSrc={imageAsset} filterId={filterId} />

        </AbsoluteFill>
    );
};