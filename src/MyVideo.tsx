import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { createNoise2D } from 'simplex-noise';

const MyVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const noise2D = createNoise2D();

    // Calculate the color based on the frame
    const waterColor = interpolateColors(frame, durationInFrames);

    // Calculate the wave animation
    const waveAnimation = (x: number, y: number) => {
        const noiseValue = noise2D(x, y + frame / 10);
        return (noiseValue + 1) / 2;
    };

    return (
        <AbsoluteFill style={{ backgroundColor: waterColor }}>
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05)),
                               linear-gradient(180deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05))`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0',
                        transform: `translateY(${waveAnimation(frame, 0)}px)`
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05)),
                               linear-gradient(180deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05))`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '10px 10px',
                        transform: `translateY(${waveAnimation(frame, 1)}px)`
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05)),
                               linear-gradient(180deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05))`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '20px 20px',
                        transform: `translateY(${waveAnimation(frame, 2)}px)`
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05)),
                               linear-gradient(180deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05))`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '30px 30px',
                        transform: `translateY(${waveAnimation(frame, 3)}px)`
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05)),
                               linear-gradient(180deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05))`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '40px 40px',
                        transform: `translateY(${waveAnimation(frame, 4)}px)`
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05)),
                               linear-gradient(180deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05))`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '50px 50px',
                        transform: `translateY(${waveAnimation(frame, 5)}px)`
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05)),
                               linear-gradient(180deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05))`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '60px 60px',
                        transform: `translateY(${waveAnimation(frame, 6)}px)`
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05)),
                               linear-gradient(180deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05))`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '70px 70px',
                        transform: `translateY(${waveAnimation(frame, 7)}px)`
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05)),
                               linear-gradient(180deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05))`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '80px 80px',
                        transform: `translateY(${waveAnimation(frame, 8)}px)`
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05)),
                               linear-gradient(180deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05))`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '90px 90px',
                        transform: `translateY(${waveAnimation(frame, 9)}px)`
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};

// Function to interpolate colors
const interpolateColors = (frame: number, durationInFrames: number) => {
    const t = frame / durationInFrames;
    const startColor = [135, 206, 250]; // Light Blue
    const midColor = [65, 105, 225]; // Royal Blue
    const endColor = [0, 128, 128]; // Teal

    if (t < 0.5) {
        const midT = t * 2;
        return `rgb(${interpolate(midT, [0, 1], [startColor[0], midColor[0]])},${interpolate(midT, [0, 1], [startColor[1], midColor[1]])},${interpolate(midT, [0, 1], [startColor[2], midColor[2]])})`;
    } else {
        const midT = (t - 0.5) * 2;
        return `rgb(${interpolate(midT, [0, 1], [midColor[0], endColor[0]])},${interpolate(midT, [0, 1], [midColor[1], endColor[1]])},${interpolate(midT, [0, 1], [midColor[2], endColor[2]])})`;
    }
};

export default MyVideo;
