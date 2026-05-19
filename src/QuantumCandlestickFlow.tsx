import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    Easing,
    random,
    spring,
} from 'remotion';

// Data lebih padat untuk detail yang lebih kecil
const generateData = () => {
    const data = [];
    let current = 500;
    for (let i = 0; i < 30; i++) {
        const o = current;
        const c = o + (random(`c-${i}`) - 0.5) * 600; // Gerakan lebih ekstrim
        const h = Math.max(o, c) + random(`h-${i}`) * 100;
        const l = Math.min(o, c) - random(`l-${i}`) * 100;
        data.push({ o, c, h, l });
        current = c;
    }
    return data;
};

const baseData = generateData();

const colors = {
    bg: '#04070d',
    bullish: '#00ff95', // Lebih vibrant green
    bearish: '#ff0055', // Lebih deep neon red
    accent: '#5856d6',
    grid: 'rgba(88, 86, 214, 0.1)',
};

export const QuantumCandlestickFlow: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames, fps } = useVideoConfig();

    // Skala 4K (3840x2160)
    const scale = height / 2160;
    const focusX = width * 0.8; // Titik fokus harga di sebelah kanan

    // Mirroring data untuk loop seamless
    const mirroredData = useMemo(() => {
        const reversed = [...baseData].reverse().map(d => ({ ...d, o: d.c, c: d.o, h: d.h, l: d.l }));
        return [...baseData, ...reversed];
    }, []);

    const step = 120 * scale; // Lebar tetap per candle untuk detail
    const totalDataWidth = mirroredData.length * step;

    const progress = frame / durationInFrames;
    const scrollOffset = progress * totalDataWidth; // Bergeser tepat 1 siklus data

    // Variabel Pendukung Visual
    // Hitung range harga dinamis agar tidak terpotong
    const { minP, maxP } = useMemo(() => {
        const prices = mirroredData.flatMap(d => [d.h, d.l]);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        // Tambahkan buffer agar tidak menyentuh ujung layar
        const buffer = (max - min) * 0.2;
        return { minP: min - buffer, maxP: max + buffer };
    }, [mirroredData]);

    const yScale = (price: number) =>
        interpolate(price, [minP, maxP], [height * 0.82, height * 0.18]); // Area aman

    // Mencari harga saat ini berdasarkan posisi scroll
    const currentIndex = Math.floor(((scrollOffset + focusX) % totalDataWidth) / step);
    const currentCandle = mirroredData[currentIndex % mirroredData.length];
    const currentPriceY = yScale(currentCandle.c);

    // Generate label harga dinamis berdasarkan data
    const priceLabels = useMemo(() => {
        return [0, 0.25, 0.5, 0.75, 1].map(p =>
            Math.round(minP + (maxP - minP) * p)
        ).reverse();
    }, [minP, maxP]);

    return (
        <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: 'Inter, sans-serif' }}>
            {/* 1. Background Grid 3D */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(${colors.grid} 2px, transparent 2px), linear-gradient(90deg, ${colors.grid} 2px, transparent 2px)`,
                backgroundSize: `${100 * scale}px ${100 * scale}px`,
                transform: `perspective(1200px) rotateX(65deg) translateY(${(progress * 1000 * scale) % (100 * scale)}px)`,
                maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)',
                opacity: 0.5
            }} />

            {/* 2. Glow Lighting */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle, ${colors.accent}15 0%, transparent 70%)`,
                transform: 'translate(-50%, -50%)',
                filter: `blur(${100 * scale}px)`
            }} />

            {/* 3. Main Chart SVG */}
            <svg width={width} height={height} style={{ overflow: 'visible', zIndex: 10 }}>
                <defs>
                    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation={25 * scale} result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* 4. Sumbu Harga (Y-Axis Labels) */}
                <g transform={`translate(${width - 150 * scale}, 0)`}>
                    {priceLabels.map((p) => (
                        <g key={p}>
                            <text
                                y={yScale(p)}
                                fill="rgba(255,255,255,0.3)"
                                fontSize={24 * scale}
                                fontWeight="bold"
                                textAnchor="start"
                                dx={20 * scale}
                                dy={8 * scale}
                            >
                                {p}.00
                            </text>
                            <line
                                x1={-width} y1={yScale(p)} x2={0} y2={yScale(p)}
                                stroke="white" opacity={0.05} strokeWidth={1 * scale}
                            />
                        </g>
                    ))}
                </g>

                {/* 5. Garis Harga Aktif (Price Line) */}
                <line
                    x1={0} y1={currentPriceY} x2={width} y2={currentPriceY}
                    stroke={currentCandle.c >= currentCandle.o ? colors.bullish : colors.bearish}
                    strokeWidth={2 * scale}
                    strokeDasharray={`${20 * scale} ${20 * scale}`}
                    opacity={0.5}
                />
                <rect
                    x={width - 220 * scale}
                    y={currentPriceY - 25 * scale}
                    width={180 * scale}
                    height={50 * scale}
                    fill={currentCandle.c >= currentCandle.o ? colors.bullish : colors.bearish}
                    rx={10 * scale}
                />
                <text x={width - 200 * scale} y={currentPriceY + 8 * scale} fill="black" fontSize={26 * scale} fontWeight="900">
                    {currentCandle.c.toFixed(2)}
                </text>

                <g transform={`translate(${-scrollOffset}, 0)`}>
                    {/* Render 3 kali untuk memastikan gap tertutup saat scroll cepat */}
                    {[0, 1, 2].map((iteration) => (
                        <g key={iteration} transform={`translate(${iteration * totalDataWidth}, 0)`}>
                            {mirroredData.map((d, i) => {
                                const isBullish = d.c >= d.o;
                                const color = isBullish ? colors.bullish : colors.bearish;
                                const x = i * step + step / 2;

                                const yOpen = yScale(d.o);
                                const yClose = yScale(d.c);
                                const yHigh = yScale(d.h);
                                const yLow = yScale(d.l);

                                const candleTop = Math.min(yOpen, yClose);
                                const candleHeight = Math.max(Math.abs(yOpen - yClose), 4 * scale);

                                return (
                                    <g key={i}>
                                        {/* Wick */}
                                        <line
                                            x1={x} y1={yHigh} x2={x} y2={yLow}
                                            stroke={color} strokeWidth={4 * scale}
                                        />
                                        {/* Body yang lebih ramping */}
                                        <rect
                                            x={x - (step * 0.2)}
                                            y={candleTop}
                                            width={step * 0.4}
                                            height={candleHeight}
                                            fill={color === colors.bullish ? color : 'transparent'}
                                            stroke={color}
                                            strokeWidth={2 * scale}
                                            rx={8 * scale}
                                            filter="url(#neonGlow)"
                                        />
                                    </g>
                                );
                            })}
                        </g>
                    ))}
                </g>
            </svg>

            {/* 4. Overlay UI */}
            <div style={{
                position: 'absolute',
                top: 100 * scale,
                left: 100 * scale,
                color: 'white',
                zIndex: 100
            }}>
                <div style={{
                    fontSize: 24 * scale,
                    fontWeight: 'bold',
                    letterSpacing: 10 * scale,
                    color: colors.bullish,
                    marginBottom: 20 * scale
                }}>
                    QUANTUM_ANALYSIS_V4
                </div>
                <div style={{
                    fontSize: 120 * scale,
                    fontWeight: 900,
                    lineHeight: 1
                }}>
                    BTC <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span> USDT
                </div>
            </div>

            {/* 5. Realtime Ticker (Bottom) */}
            <div style={{
                position: 'absolute',
                bottom: 100 * scale,
                width: '100%',
                padding: `0 ${100 * scale}px`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                zIndex: 100
            }}>
                <div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 * scale, fontWeight: 'bold' }}>VOLATILITY_INDEX</div>
                    <div style={{ color: colors.bullish, fontSize: 60 * scale, fontWeight: 900 }}>HIGH_STABLE</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        padding: `${20 * scale}px ${40 * scale}px`,
                        borderRadius: 20 * scale,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        fontSize: 32 * scale,
                        color: 'white',
                        fontWeight: 'bold'
                    }}>
                        4K 60FPS // SEAMLESS_LOOP
                    </div>
                </div>
            </div>

            {/* Cinematic Vignette */}
            <div style={{
                position: 'absolute',
                inset: 0,
                boxShadow: `inset 0 0 ${500 * scale}px rgba(0,0,0,0.9)`,
                pointerEvents: 'none',
                zIndex: 200
            }} />
        </AbsoluteFill>
    );
};