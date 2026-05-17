import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { BarItem } from './BarItem';
import { SeamlessLoopBackground } from './SeamlessLoopBackground';
import data from './socialMediaData.json';

export const DataVizComposition: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Progress transisi antar tahun secara halus (0 sampai data.length - 1)
    const globalProgress = interpolate(frame, [0, durationInFrames], [0, data.length - 1]);
    const startIndex = Math.floor(globalProgress);
    const endIndex = Math.min(startIndex + 1, data.length - 1);
    const interpolationFactor = globalProgress % 1;

    const startData = data[startIndex];
    const endData = data[endIndex];

    const maxVal = Math.max(...data.flatMap(d => d.values.map(v => v.value)));

    return (
        <AbsoluteFill style={{ backgroundColor: '#020617' }}>
            <SeamlessLoopBackground />

            <AbsoluteFill style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 100
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: 60,
                    color: 'white',
                    fontFamily: 'sans-serif'
                }}>
                    <h1 style={{ fontSize: 60, margin: 0, letterSpacing: 2 }}>GLOBAL APP USERS</h1>
                    <div style={{
                        fontSize: 80,
                        fontWeight: 'bold',
                        color: '#818cf8',
                        marginTop: 10
                    }}>
                        YEAR {startData.year}
                    </div>
                </div>

                {/* Chart */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {startData.values.map((item, i) => {
                        const startValue = item.value;
                        const endValue = endData.values[i].value;
                        // Hitung nilai tengah secara presisi setiap frame
                        const currentValue = interpolate(interpolationFactor, [0, 1], [startValue, endValue]);

                        return (
                            <BarItem
                                key={item.category}
                                label={item.category}
                                value={currentValue}
                                maxValue={maxVal}
                                color={item.color}
                                index={i}
                            />
                        );
                    })}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};