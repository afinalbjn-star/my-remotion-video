import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    Easing,
} from 'remotion';
import { fetchHistoricalPriceData, fetchHistoricalLiquidityData, fetchHistoricalVolumeData, fetchHistoricalVolatilityData } from './AssetManager';

interface InstitutionalLiquidityPulseProps {
    coinSymbol: string;
}

const deepNavy = "#0A1128";
const gold = "#FFD700";
const white = "#FFFFFF"; // Putih
const green = "#22C55E"; // Hijau
const red = "#FF4444";   // Merah
const lightGray = "#B0BEC5";

// Helper to calculate path length
const calculatePathLength = (points: { x: number; y: number }[]): number => {
    let length = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        length += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
    return length;
};

// Helper to get cumulative lengths for perfect sync
const getCumulativeLengths = (points: { x: number; y: number }[]) => {
    let length = 0;
    const lengths = [0];
    for (let i = 0; i < points.length - 1; i++) {
        const dx = points[i + 1].x - points[i].x;
        const dy = points[i + 1].y - points[i].y;
        length += Math.sqrt(dx * dx + dy * dy);
        lengths.push(length);
    }
    return { cumulative: lengths, total: length };
};

export const InstitutionalLiquidityPulse: React.FC<InstitutionalLiquidityPulseProps> = ({ coinSymbol }) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const scale = height / 1080; // Scaling factor for 4K (2160 / 1080 = 2)

    const priceHistory = useMemo(() => fetchHistoricalPriceData(coinSymbol, durationInFrames), [coinSymbol, durationInFrames]);
    const liquidityHistory = useMemo(() => fetchHistoricalLiquidityData(coinSymbol, durationInFrames), [coinSymbol, durationInFrames]);
    const volumeHistory = useMemo(() => fetchHistoricalVolumeData(coinSymbol, durationInFrames), [coinSymbol, durationInFrames]);
    const volatilityHistory = useMemo(() => fetchHistoricalVolatilityData(coinSymbol, durationInFrames), [coinSymbol, durationInFrames]);

    const maxPrice = Math.max(...priceHistory.map(d => d.value));
    const minPrice = Math.min(...priceHistory.map(d => d.value));
    const maxLiquidity = Math.max(...liquidityHistory.map(d => d.value));
    const minLiquidity = Math.min(...liquidityHistory.map(d => d.value));
    const maxVolume = Math.max(...volumeHistory.map(d => d.value));
    const minVolume = Math.min(...volumeHistory.map(d => d.value));
    const maxVolat = Math.max(...volatilityHistory.map(d => d.value));
    const minVolat = Math.min(...volatilityHistory.map(d => d.value));

    const chartPadding = 100 * scale;
    const chartWidth = width - 2 * chartPadding;
    const chartHeight = height * 0.5; // Use half of the screen for charts
    const chartYOffset = height * 0.25; // Center charts vertically

    // Handle case where durationInFrames might be 1 to prevent division by zero
    const xScale = (index: number) => chartPadding + (index / (durationInFrames > 1 ? durationInFrames - 1 : 1)) * chartWidth;
    const yScalePrice = (value: number) => interpolate(value, [minPrice, maxPrice], [chartYOffset + chartHeight, chartYOffset], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const yScaleLiquidity = (value: number) => interpolate(value, [minLiquidity, maxLiquidity], [chartYOffset + chartHeight, chartYOffset], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const yScaleVolume = (value: number) => interpolate(value, [minVolume, maxVolume], [chartYOffset + chartHeight, chartYOffset], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const yScaleVolat = (value: number) => interpolate(value, [minVolat, maxVolat], [chartYOffset + chartHeight, chartYOffset], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Data structures for 4 curves
    const curves = useMemo(() => {
        const pPoints = priceHistory.map((d, i) => ({ x: xScale(i), y: yScalePrice(d.value) }));
        const lPoints = liquidityHistory.map((d, i) => ({ x: xScale(i), y: yScaleLiquidity(d.value) }));
        const vPoints = volumeHistory.map((d, i) => ({ x: xScale(i), y: yScaleVolume(d.value) }));
        const vtPoints = volatilityHistory.map((d, i) => ({ x: xScale(i), y: yScaleVolat(d.value) }));

        const createPath = (pts: { x: number, y: number }[]) => pts.reduce((acc, p, i) => i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`, '');

        return [
            { id: 'white', color: white, points: pPoints, path: createPath(pPoints), stats: getCumulativeLengths(pPoints), delay: 0, duration: 280 },
            { id: 'yellow', color: gold, points: lPoints, path: createPath(lPoints), stats: getCumulativeLengths(lPoints), delay: 20, duration: 280 },
            { id: 'green', color: green, points: vPoints, path: createPath(vPoints), stats: getCumulativeLengths(vPoints), delay: 40, duration: 250 },
            { id: 'red', color: red, points: vtPoints, path: createPath(vtPoints), stats: getCumulativeLengths(vtPoints), delay: 10, duration: 290 },
        ];
    }, [priceHistory, liquidityHistory, volumeHistory, volatilityHistory, xScale, yScalePrice, yScaleLiquidity, yScaleVolume, yScaleVolat]);

    return (
        <AbsoluteFill style={{ backgroundColor: deepNavy, fontFamily: 'Inter, sans-serif' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: `linear-gradient(${lightGray} 1px, transparent 1px), linear-gradient(90deg, ${lightGray} 1px, transparent 1px)`, backgroundSize: `50px 50px` }} />

            <div style={{ position: 'absolute', top: 50, left: chartPadding, right: chartPadding, color: gold, fontSize: 48, fontWeight: 'bold', textAlign: 'center' }}>
                Institutional Liquidity & Whale Pulse (4K)
            </div>

            <svg width={width} height={height} style={{ overflow: 'visible' }}>
                {/* Background Grid Lines */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <line
                        key={`grid-${i}`}
                        x1={chartPadding}
                        y1={chartYOffset + (i / 4) * chartHeight}
                        x2={width - chartPadding}
                        y2={chartYOffset + (i / 4) * chartHeight}
                        stroke={lightGray}
                        strokeWidth={1}
                        opacity={0.1}
                    />
                ))}

                {curves.map(curve => {
                    // Hitung progress individual untuk tiap kurva
                    const curveProgress = interpolate(frame, [curve.delay, curve.delay + curve.duration], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                        easing: Easing.bezier(0.33, 1, 0.68, 1)
                    });

                    const currentDist = curveProgress * curve.stats.total;
                    // Mapping progress ke index data (0 - 299)
                    const dataIndex = Math.floor(curveProgress * (curve.points.length - 1));
                    const currentPoint = curve.points[dataIndex];

                    if (!currentPoint) {
                        return null;
                    }

                    return (
                        <React.Fragment key={curve.id}>
                            <path
                                d={curve.path}
                                fill="none"
                                stroke={curve.color}
                                strokeWidth={4 * scale}
                                strokeDasharray={curve.stats.total}
                                strokeDashoffset={curve.stats.total - currentDist}
                                style={{ filter: `drop-shadow(0 0 ${5 * scale}px ${curve.color}50)` }}
                            />
                            {curveProgress > 0 && (
                                <>
                                    <circle
                                        cx={currentPoint.x}
                                        cy={currentPoint.y}
                                        r={8 * scale}
                                        fill={curve.color}
                                        style={{ filter: `drop-shadow(0 0 ${12 * scale}px ${curve.color})` }}
                                    />
                                    {/* Dynamic Floating Values */}
                                    <text
                                        x={currentPoint.x + 15}
                                        y={currentPoint.y - 15}
                                        fill={curve.color}
                                        fontSize={22 * scale}
                                        fontWeight="900"
                                        style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
                                    >
                                        {curve.id === 'white' && `$${priceHistory[dataIndex].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                        {curve.id === 'yellow' && `${liquidityHistory[dataIndex].value.toLocaleString()} BTC`}
                                        {curve.id === 'green' && `VOL: ${volumeHistory[dataIndex].value.toFixed(0)}`}
                                        {curve.id === 'red' && `${volatilityHistory[dataIndex].value.toFixed(1)}%`}
                                    </text>
                                </>
                            )}
                        </React.Fragment>
                    );
                })}

                {/* Professional Axis Labels */}
                <text x={chartPadding} y={chartYOffset - 20 * scale} fill={white} fontSize={16 * scale} opacity={0.6}>PRICE / LIQUIDITY INDEX</text>
                <text x={width - chartPadding} y={chartYOffset - 20 * scale} fill={gold} fontSize={16 * scale} opacity={0.6} textAnchor="end">INSTITUTIONAL PULSE</text>

                {/* X-Axis Time Markers */}
                {Array.from({ length: 6 }).map((_, i) => (
                    <text
                        key={`time-${i}`}
                        x={chartPadding + (i / 5) * chartWidth}
                        y={chartYOffset + chartHeight + 40}
                        fill={lightGray} // Keep lightGray for time markers
                        fontSize={18 * scale}
                        textAnchor="middle"
                        opacity={0.4}
                    >
                        T-{5 - i}H
                    </text>
                ))}
            </svg>

            {/* Professional Data Columns (Footer) */}
            <div style={{ position: 'absolute', bottom: 40 * scale, left: chartPadding, right: chartPadding, display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${lightGray}33`, paddingTop: 20 * scale }}>
                <MetricBox label="REALTIME_PRICE" value={`$${priceHistory[frame].value.toFixed(2)}`} color={white} scale={scale} />
                <MetricBox label="WHALE_OUTFLOW" value={`${liquidityHistory[frame].value.toFixed(0)} BTC`} color={gold} scale={scale} />
                <MetricBox label="MARKET_VOL" value={`${volumeHistory[frame].value.toFixed(2)}`} color={green} scale={scale} />
                <MetricBox label="RISK_INDEX" value={`${volatilityHistory[frame].value.toFixed(1)}%`} color={red} scale={scale} />
            </div>
        </AbsoluteFill>
    );
};

const MetricBox: React.FC<{ label: string, value: string, color: string, scale: number }> = ({ label, value, color, scale }) => (
    <div style={{ textAlign: 'left' }}>
        <div style={{ color: lightGray, fontSize: 14 * scale, fontWeight: 'bold', letterSpacing: 2 * scale, marginBottom: 5 * scale }}>{label}</div>
        <div style={{ color, fontSize: 28 * scale, fontWeight: '900', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
);