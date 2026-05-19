import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    random,
    Easing,
} from 'remotion';

interface StockPoint {
    price: number;
    vol: number;
    sma?: number; // Simple Moving Average
}

// Data simulasi bursa
const stockData: StockPoint[] = [
    { price: 4200, vol: 1.2 }, { price: 4250, vol: 1.5 }, { price: 4220, vol: 1.1 },
    { price: 4300, vol: 2.1 }, { price: 4350, vol: 2.5 }, { price: 4320, vol: 1.8 },
    { price: 4400, vol: 3.0 }, { price: 4380, vol: 2.2 }, { price: 4450, vol: 2.8 },
    { price: 4420, vol: 2.0 }, { price: 4500, vol: 3.5 }, { price: 4480, vol: 3.1 }
];

const colors = {
    bg: '#020617',
    up: '#10b981',
    down: '#ef4444',
    accent: '#3b82f6',
    secondary: '#6366f1', // Warna untuk Moving Average
    text: '#f8fafc',
};

export const StockMarketSeamless: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const scale = height / 1080; // Skala proporsional yang lebih tajam

    // Mirroring data agar loop tidak terputus (A -> B -> A)
    const mirroredData = useMemo<StockPoint[]>(() => {
        const base = [...stockData];
        // Kalkulasi SMA-3 sederhana
        const withSma = base.map((d, i) => {
            if (i < 2) return d;
            const avg = (base[i].price + base[i - 1].price + base[i - 2].price) / 3;
            return { ...d, sma: avg };
        });
        const reversed = [...withSma].reverse().slice(1, -1);
        return [...withSma, ...reversed];
    }, []);

    const maxPrice = Math.max(...mirroredData.map(d => d.price));
    const minPrice = Math.min(...mirroredData.map(d => d.price));

    const chartWidth = width * 0.8;
    const chartHeight = height * 0.5;
    const step = chartWidth / (mirroredData.length - 1);

    // Progress loop global
    const loopProgress = frame / durationInFrames;

    // Koordinat titik
    const points = useMemo(() => {
        return mirroredData.map((d, i) => ({
            x: (width - chartWidth) / 2 + i * step,
            y: height / 2 + (chartHeight / 2) - ((d.price - minPrice) / (maxPrice - minPrice)) * chartHeight
        }));
    }, [mirroredData, maxPrice, minPrice, width, height, chartWidth, chartHeight, step]);

    const smaPoints = useMemo(() => {
        return mirroredData.map((d, i) => d.sma ? ({
            x: (width - chartWidth) / 2 + i * step,
            y: height / 2 + (chartHeight / 2) - ((d.sma - minPrice) / (maxPrice - minPrice)) * chartHeight
        }) : null).filter(Boolean) as { x: number, y: number }[];
    }, [mirroredData, maxPrice, minPrice, width, height, chartWidth, chartHeight, step]);

    const linePath = points.reduce((acc, p, i) =>
        i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`, '');

    const smaPath = smaPoints.reduce((acc, p, i) =>
        i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`, '');

    // Animasi "Ular" atau jalur yang berjalan
    const pathLength = 5000 * scale;
    const dashOffset = interpolate(loopProgress, [0, 1], [pathLength, 0]);

    // Ambil index data saat ini untuk statistik dinamis
    const currentIndex = Math.floor(loopProgress * (mirroredData.length - 1));
    const currentItem = mirroredData[currentIndex];
    const isPositive = currentIndex > 0 ? currentItem.price >= mirroredData[currentIndex - 1].price : true;

    // Menggunakan fungsi random() dari Remotion agar persentase tetap konsisten (deterministik)
    const dynamicChange = (random(`change-${currentIndex}`) * 2.5).toFixed(2);

    return (
        <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: 'Inter, sans-serif' }}>
            {/* 1. Background Grid 3D */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.1,
                backgroundImage: `linear-gradient(${colors.accent} 2px, transparent 2px), linear-gradient(90deg, ${colors.accent} 2px, transparent 2px)`,
                backgroundSize: `${150 * scale}px ${150 * scale}px`,
                transform: `perspective(1000px) rotateX(60deg) translateY(${(frame % 150) * scale}px)`,
                maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
            }} />

            {/* 2. Header UI */}
            <div style={{ position: 'absolute', top: 100 * scale, left: 150 * scale, right: 150 * scale, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ color: colors.accent, fontSize: 24 * scale, fontWeight: 'bold', letterSpacing: 4 * scale }}>MARKET_INDEX_V4</div>
                    <div style={{ color: colors.text, fontSize: 80 * scale, fontWeight: 900 }}>NASDAQ_COMPOSITE</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: isPositive ? colors.up : colors.down, fontSize: 100 * scale, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                        {currentItem.price.toFixed(2)}
                    </div>
                    <div style={{ color: isPositive ? colors.up : colors.down, fontSize: 32 * scale, fontWeight: 'bold' }}>
                        {isPositive ? '▲' : '▼'} +{dynamicChange}%
                    </div>
                </div>
            </div>

            {/* 3. Main Chart SVG */}
            <svg width={width} height={height} style={{ overflow: 'visible' }}>
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation={10 * scale} result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors.accent} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area di bawah grafik */}
                <path
                    d={`${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`}
                    fill="url(#grad)"
                    opacity={0.3}
                />

                {/* 3.1 Moving Average Line */}
                <path
                    d={smaPath}
                    fill="none"
                    stroke={colors.secondary}
                    strokeWidth={4 * scale}
                    opacity={0.5}
                />

                {/* Garis Utama */}
                <path
                    d={linePath}
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth={8 * scale}
                    strokeDasharray={pathLength}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    filter="url(#glow)"
                />

                {/* 4. Moving Indicator Tooltip Group */}
                <g transform={`translate(${points[currentIndex].x}, ${points[currentIndex].y})`}>
                    {/* Outer Glow Circle */}
                    <circle
                        r={20 * scale}
                        fill={colors.accent}
                        opacity={0.3}
                    />
                    {/* Core Indicator Dot */}
                    <circle
                        r={12 * scale}
                        fill="white"
                        filter="url(#glow)"
                    />

                    {/* Floating Statistics Labels */}
                    <text
                        x={30 * scale}
                        y={-40 * scale}
                        fill="white"
                        fontSize={54 * scale}
                        fontWeight={900}
                        style={{ fontFamily: 'monospace', textShadow: '0 0 15px rgba(0,0,0,0.8)' }}
                    >
                        {currentItem.price.toFixed(2)}
                    </text>

                    <text
                        x={30 * scale}
                        y={10 * scale}
                        fill={colors.accent}
                        fontSize={28 * scale}
                        fontWeight="bold"
                        style={{ letterSpacing: 2 * scale }}
                    >
                        V_IDX: {currentItem.vol.toFixed(2)}M
                    </text>

                    {/* Small connection line to price */}
                    <line
                        x1={0} y1={0} x2={25 * scale} y2={-25 * scale}
                        stroke="white" strokeWidth={2 * scale} opacity={0.5}
                    />
                </g>
            </svg>

            {/* 4. Footer Statistics */}
            <div style={{
                position: 'absolute',
                bottom: 100 * scale,
                left: 150 * scale,
                right: 150 * scale,
                display: 'flex',
                gap: 100 * scale,
                borderTop: `1px solid rgba(255,255,255,0.1)`,
                paddingTop: 40 * scale
            }}>
                <StatBox label="VOLUME (24H)" value={`${currentItem.vol.toFixed(1)}M BTC`} scale={scale} />
                <StatBox label="MARKET CAP" value="$3.2T" scale={scale} />
                <StatBox label="STABILITY" value="OPTIMIZED" scale={scale} color={colors.up} />
                <StatBox label="FPS_TARGET" value="60_STABLE" scale={scale} />
            </div>

            {/* Scanning Line Effect */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: `${loopProgress * 100}%`,
                width: 2 * scale,
                height: '100%',
                background: `linear-gradient(to bottom, transparent, ${colors.accent}, transparent)`,
                boxShadow: `0 0 20px ${colors.accent}`,
                opacity: 0.5
            }} />

            {/* Cinematic Vignette */}
            <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${400 * scale}px rgba(0,0,0,0.8)`, pointerEvents: 'none' }} />
        </AbsoluteFill>
    );
};

const StatBox: React.FC<{ label: string, value: string, scale: number, color?: string }> = ({ label, value, scale, color }) => (
    <div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 * scale, fontWeight: 'bold', marginBottom: 10 * scale }}>{label}</div>
        <div style={{ color: color || colors.text, fontSize: 36 * scale, fontWeight: 900 }}>{value}</div>
    </div>
);