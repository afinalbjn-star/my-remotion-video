import React from 'react';
import { AbsoluteFill } from 'remotion';
import { WaveBackgroundProps } from './index';

export const WaveBackground: React.FC<WaveBackgroundProps> = ({
    imageSrc,
    filterId,
}) => {
    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
            }}
        >
            {/* Sedikit memperbesar gambar (scale: 1.15) agar bagian tepi gambar yang terdistorsi 
				oleh efek Liquid tidak memperlihatkan area kosong/blank di luar frame.
			*/}
            <img
                src={imageSrc}
                alt="Wave Pattern"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: `url(#${filterId})`,
                    transform: 'scale(1.15)',
                    transformOrigin: 'center center',
                }}
            />
        </AbsoluteFill>
    );
};