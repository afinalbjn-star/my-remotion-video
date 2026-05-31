import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
} from 'remotion';

const LINES = 40;

export const CyberGridTunnel: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();

    const progress = frame / durationInFrames;
    const t = progress * Math.PI * 2; // Loop angle (0 to 2PI)

    const speed = 1.2;
    const pulsing = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 5)); // Cycles must be integer
    const shake = 5 * Math.sin(t * 20);
    const glitchOffset = interpolate(Math.sin(t * 10), [-1, 1], [-15, 15]);

    return (
        <AbsoluteFill style={{ backgroundColor: 'black', overflow: 'hidden' }}>
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    transform: `translate(${shake}px, ${-shake}px)`,
                }}
            >
                <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    style={{ transform: `translateX(${glitchOffset}px)` }}
                >
                    <defs>
                        <radialGradient id="bg" cx="50%" cy="50%" r="70%">
                            <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,1)" />
                        </radialGradient>

                        {/* scanline */}
                        <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="4" height="2" fill="rgba(255,255,255,0.03)" />
                        </pattern>
                    </defs>

                    <rect width={width} height={height} fill="url(#bg)" />

                    {Array.from({ length: LINES }).map((_, i) => {
                        const ratio = i / (LINES - 1);
                        const depth = ratio * 3;
                        const perspective = 1 / (0.4 + depth);
                        const centerX = width / 2;
                        const centerY = height / 2;

                        // speed * 10 (durasi dlm detik) harus menghasilkan bilangan bulat agar modulo sinkron
                        const zMove = (progress * (10 * speed)) % 1;
                        const phase = (ratio + zMove) % 1;

                        const color = `rgba(${180 + 75 * ratio}, ${50 + 200 * (1 - ratio)}, ${200 + 30 * ratio}, ${0.7 * pulsing})`;
                        const scale = 0.4 + perspective * 1.4;

                        const halfW = width * scale;
                        const halfH = height * scale * 0.35;

                        const x1 = centerX - halfW;
                        const x2 = centerX + halfW;
                        const y = centerY + (phase - 0.5) * height * 1.6;

                        const yTop = centerY - halfH;
                        const yBottom = centerY + halfH;
                        const x = centerX + (phase - 0.5) * width * 1.6;

                        const blur = 10 * (1 - perspective);

                        return (
                            <g key={i}>
                                <line
                                    x1={x1}
                                    y1={y}
                                    x2={x2}
                                    y2={y}
                                    stroke={color}
                                    strokeWidth={2}
                                    style={{ filter: `blur(${blur}px)` }}
                                />
                                <line
                                    x1={x}
                                    y1={yTop}
                                    x2={x}
                                    y2={yBottom}
                                    stroke={color}
                                    strokeWidth={2}
                                    style={{ filter: `blur(${blur}px)` }}
                                />
                            </g>
                        );
                    })}

                    {/* portal glow */}
                    <circle
                        cx={width / 2}
                        cy={height / 2}
                        r={height * 0.16 + 8 * Math.sin(t * 4)}
                        fill="none"
                        stroke="rgba(255, 0, 180, 0.75)"
                        strokeWidth={6}
                    />
                    <circle
                        cx={width / 2}
                        cy={height / 2}
                        r={height * 0.12 + 6 * Math.cos(t * 3)}
                        fill="none"
                        stroke="rgba(0, 255, 255, 0.8)"
                        strokeWidth={4}
                    />

                    {/* partikel neon */}
                    {Array.from({ length: 80 }).map((_, i) => {
                        const pr = ((i * 73) % 100) / 100;

                        // Kecepatan harus dihitung agar total jarak = kelipatan lebar/tinggi
                        // Jarak = frame * speed. Misal 600 * 6.4 = 3840 (tepat 1x lebar 4K)
                        const px = (pr * width + frame * 6.4) % width;
                        const py = ((1 - pr) * height + frame * 3.6) % height;

                        const size = 2 + 5 * pr;
                        const alpha = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * 8 + i));
                        const c =
                            i % 2 === 0
                                ? `rgba(255, 0, 200, ${alpha})`
                                : `rgba(0, 255, 255, ${alpha})`;
                        return <circle key={i} cx={px} cy={py} r={size} fill={c} />;
                    })}

                    {/* overlay scanline */}
                    <rect width={width} height={height} fill="url(#scan)" />
                </svg>
            </div>
        </AbsoluteFill>
    );
};