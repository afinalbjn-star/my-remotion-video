import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    Easing,
    random,
} from 'remotion';

// Data pertumbuhan dasar
const baseData = [
    { val: 20 }, { val: 180 }, { val: 40 }, { val: 220 },
    { val: 60 }, { val: 280 }, { val: 30 }, { val: 320 },
    { val: 100 }, { val: 400 }, { val: 80 }, { val: 450 }
];

const primaryColor = "#00f2ff";
const secondaryColor = "#7000ff";
const bgColor = "#05070a";

export const CorporateGrowthSeamless: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Variabel skala untuk menyesuaikan elemen UI ke 4K secara proporsional
    const scale = height / 1080;

    // Mirroring data agar loop seamless (A -> B -> A)
    const mirroredData = useMemo(() => {
        const reversed = [...baseData].reverse().slice(1, -1);
        return [...baseData, ...reversed];
    }, []);

    const maxVal = Math.max(...mirroredData.map(d => d.val));
    const chartWidth = width * 0.7;
    const chartHeight = height * 0.4;
    const step = chartWidth / (mirroredData.length - 1);
    const paddingX = (width - chartWidth) / 2;

    // Progress loop (0 ke 1)
    const progress = frame / durationInFrames;

    // Koordinat titik grafik
    const points = useMemo(() => {
        return mirroredData.map((d, i) => ({
            x: paddingX + i * step,
            y: height * 0.65 - (d.val / maxVal) * chartHeight
        }));
    }, [mirroredData, maxVal, chartHeight, height, paddingX, step]);

    // Membuat Path SVG untuk Line Chart
    const linePath = useMemo(() => {
        return points.reduce((acc, p, i) =>
            i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`,
            '');
    }, [points]);

    // 1. Hitung panjang jalur untuk posisi presisi kepala ular
    const { cumulativeLengths, totalPathLength } = useMemo(() => {
        let len = 0;
        const lengths = [0];
        for (let i = 0; i < points.length - 1; i++) {
            const dx = points[i + 1].x - points[i].x;
            const dy = points[i + 1].y - points[i].y;
            len += Math.sqrt(dx * dx + dy * dy);
            lengths.push(len);
        }
        return { cumulativeLengths: lengths, totalPathLength: len };
    }, [points]);

    const snakeLength = 1000 * scale;
    const snakeOffset = interpolate(frame, [0, durationInFrames], [snakeLength, -totalPathLength], {
        easing: Easing.inOut(Easing.quad),
    });

    // 2. Tentukan posisi (x, y) kepala ular di jalur
    const headDist = snakeLength - snakeOffset;
    const headX = interpolate(headDist, cumulativeLengths, points.map(p => p.x), {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });
    const headY = interpolate(headDist, cumulativeLengths, points.map(p => p.y), {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });
    const headVal = interpolate(headDist, cumulativeLengths, mirroredData.map(d => d.val), {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    const opacityIn = interpolate(frame, [0, 40], [0, 1]);

    return (
        <AbsoluteFill style={{ backgroundColor: bgColor, fontFamily: 'Inter, sans-serif' }}>
            {/* 1. Cinematic Background with Grain and Perspective Grid */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                {/* Grain Noise Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.03,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    zIndex: 20
                }} />

                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-10%',
                    width: '70%',
                    height: '70%',
                    background: `radial-gradient(circle, ${primaryColor}15 0%, transparent 70%)`,
                    filter: `blur(${140 * scale}px)`,
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-10%',
                    width: '70%',
                    height: '70%',
                    background: `radial-gradient(circle, ${secondaryColor}15 0%, transparent 70%)`,
                    filter: `blur(${140 * scale}px)`,
                }} />
            </div>

            {/* Perspective Grid */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.08,
                backgroundImage: `linear-gradient(${primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)`,
                backgroundSize: `${100 * scale}px ${100 * scale}px`,
                maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)',
                transform: `perspective(${1000 * scale}px) rotateX(60deg) translateY(${50 * scale}px)`,
                transformOrigin: 'bottom'
            }} />

            {/* 2. Professional Header UI */}
            <div style={{ padding: `${60 * scale}px ${80 * scale}px`, zIndex: 30, opacity: opacityIn }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ width: 40 * scale, height: 4 * scale, backgroundColor: primaryColor, marginBottom: 15 * scale }} />
                        <h1 style={{ color: 'white', fontSize: 32 * scale, fontWeight: 900, margin: 0, letterSpacing: 4 * scale }}>
                            CORPORATE <span style={{ color: primaryColor }}>GROWTH_v4</span>
                        </h1>
                        <p style={{ color: '#4b5563', fontSize: 14 * scale, margin: 0, letterSpacing: 2 * scale, fontWeight: 600 }}>SYSTEM_STABLE // 2026_CORE_INDEX</p>
                    </div>
                    <div style={{ textAlign: 'right', color: primaryColor, opacity: 0.5, fontSize: 12 * scale, fontWeight: 'bold' }}>
                        <div>LAT: 40.7128° N</div>
                        <div>LONG: 74.0060° W</div>
                        <div>HEX_ID: {Math.floor(frame * 1024).toString(16).toUpperCase()}</div>
                    </div>
                </div>
            </div>

            {/* 3. Metrics Footer UI */}
            <div style={{
                position: 'absolute',
                bottom: 80 * scale,
                left: 80 * scale,
                right: 80 * scale,
                display: 'flex',
                justifyContent: 'space-between',
                color: 'white',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingTop: 30 * scale,
                opacity: opacityIn,
                zIndex: 30
            }}>
                <div style={{ display: 'flex', gap: 60 * scale }}>
                    <Metric label="Market Volatility" value="EXTREME" color="#ef4444" scale={scale} />
                    <Metric label="Net Expansion" value={`+${(progress * 100).toFixed(1)}%`} color={primaryColor} scale={scale} />
                    <Metric label="Status" value="OPTIMIZED" color="#22c55e" scale={scale} />
                </div>
            </div>

            {/* 3. Main Chart (Line & Bars) */}
            <svg width={width} height={height} style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id="ultraGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={primaryColor} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
                    </linearGradient>
                    <filter id="ultraGlow">
                        <feGaussianBlur stdDeviation={8 * scale} result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Bar Chart (Background Layer) */}
                {points.map((p, i) => {
                    const barHeight = height * 0.65 - p.y;
                    const barProgress = interpolate(frame - (i * 2), [0, 30], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp'
                    });

                    return (
                        <rect
                            key={i}
                            x={p.x - step / 4}
                            y={height * 0.65 - (barHeight * barProgress)}
                            width={step / 2}
                            height={barHeight * barProgress}
                            fill="url(#ultraGrad)"
                            opacity={0.2}
                            rx={4 * scale}
                        />
                    );
                })}

                {/* Line Chart */}
                <path
                    d={linePath}
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth={5 * scale}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#ultraGlow)"
                    strokeDasharray={`${snakeLength} 10000`}
                    strokeDashoffset={snakeOffset}
                />

                {/* 3. Indikator dan Label yang menempel di Kepala Ujung Depan */}
                {headDist > 0 && headDist < totalPathLength + snakeLength && (
                    <g>
                        <circle
                            cx={headX}
                            cy={headY}
                            r={12 * scale}
                            fill={primaryColor}
                            opacity={0.2}
                        >
                            <animate attributeName="r" values="12;20;12" dur="1s" repeatCount="indefinite" />
                        </circle>
                        <circle
                            cx={headX}
                            cy={headY}
                            r={4 * scale}
                            fill="white"
                            filter="url(#ultraGlow)"
                        />
                        <foreignObject x={headX + 20 * scale} y={headY - 40 * scale} width={200 * scale} height={50 * scale}>
                            <div style={{ color: 'white', fontSize: 24 * scale, fontWeight: 900, textShadow: '0 0 10px black' }}>
                                {headVal.toFixed(1)} <span style={{ fontSize: 12 * scale, color: primaryColor }}>PTS</span>
                            </div>
                        </foreignObject>
                    </g>
                )}
            </svg>

            {/* Cinematic Vignette */}
            <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${400 * scale}px rgba(0,0,0,0.8)`, pointerEvents: 'none', zIndex: 100 }} />
        </AbsoluteFill>
    );
};

const Metric: React.FC<{ label: string, value: string, color: string, scale: number }> = ({ label, value, color, scale }) => (
    <div style={{ textAlign: 'left' }}>
        <div style={{ color: '#4b5563', fontSize: 10 * scale, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 * scale, marginBottom: 5 * scale }}>
            {label}
        </div>
        <div style={{ fontSize: 24 * scale, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums', letterSpacing: -1 * scale }}>
            {value}
        </div>
    </div>
);