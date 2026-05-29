import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    random,
} from 'remotion';

// Fungsi untuk memastikan loop mulus 0 -> 2PI
const getLoopPhase = (frame: number, duration: number) => (frame / duration) * Math.PI * 2;

export const FinancialDashboard: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const phase = getLoopPhase(frame, durationInFrames);

    // 1. Grid Parallax Background
    const gridSize = 120;
    // Pergerakan diagonal yang kembali ke titik awal (seamless)
    const gridMove = interpolate(frame % durationInFrames, [0, durationInFrames], [0, gridSize]);

    // 2. Candlestick Logic (40 data points)
    const candleCount = 40;
    const candles = useMemo(() => {
        return new Array(candleCount).fill(0).map((_, i) => ({
            id: i,
            seed: random(`candle-${i}`),
            baseY: 400 + random(`y-${i}`) * 400,
        }));
    }, [candleCount]);

    const getCandleStats = (baseY: number, seed: number, i: number) => {
        // Pseudo-noise menggunakan kombinasi Sine agar loop sempurna
        const noise =
            Math.sin(phase + seed * 10) * 80 +
            Math.sin(phase * 2 + seed * 5) * 30 +
            Math.sin(phase * 0.5 + i) * 20;

        const open = baseY + noise;

        // Memodifikasi 'change' agar lebih dinamis dan tidak seragam
        const primaryChange = Math.sin(phase * 3 + seed) * 120; // Gelombang utama
        const secondaryChange = Math.cos(phase * 5 + seed * 2) * 60; // Gelombang sekunder dengan frekuensi berbeda
        // Menambahkan komponen "noise" yang tetap looping
        const tertiaryChange = interpolate(
            Math.sin(phase * 7 + seed * 3), // Menggunakan gelombang sinus lain untuk variasi
            [-1, 1],
            [-50, 50] // Rentang fluktuasi noise
        );
        const change = primaryChange + secondaryChange + tertiaryChange;
        const close = open + change;
        const high = Math.max(open, close) + Math.abs(Math.sin(phase * 4)) * 40;
        const low = Math.min(open, close) - Math.abs(Math.cos(phase * 2)) * 40;

        return { open, close, high, low, isBullish: close > open };
    };

    // Hitung data untuk Moving Average (SMA 7)
    const maPeriod = 7;
    const candleData = candles.map((c, i) => getCandleStats(c.baseY, c.seed, i));
    const maPath = candleData.map((_, i) => {
        const start = Math.max(0, i - maPeriod + 1);
        const subset = candleData.slice(start, i + 1);
        const avg = subset.reduce((acc, curr) => acc + curr.close, 0) / subset.length;
        const x = (i / candleCount) * 1900 + 50 + 15; // +15 untuk posisi tengah lilin
        return `${i === 0 ? 'M' : 'L'} ${x} ${avg}`;
    }).join(' ');

    return (
        <AbsoluteFill style={{ backgroundColor: '#02040a', color: '#e1e1e1', fontFamily: 'monospace' }}>
            {/* Glow Filter Definition */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <filter id="neonGlow">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </svg>

            {/* C. Grid Background */}
            <div style={{
                position: 'absolute',
                inset: -gridSize,
                backgroundImage: `
                    linear-gradient(to right, rgba(0, 210, 255, 0.08) 2px, transparent 2px),
                    linear-gradient(to bottom, rgba(0, 210, 255, 0.08) 2px, transparent 2px)
                `,
                backgroundSize: `${gridSize}px ${gridSize}px`,
                transform: `translate(${gridMove}px, ${gridMove}px)`,
                pointerEvents: 'none',
            }} />

            {/* Header Area */}
            <div style={{ position: 'absolute', top: 60, left: 80, right: 80, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
                <div>
                    <h1 style={{ fontSize: 72, margin: 0, color: '#00d2ff', textShadow: '0 0 30px rgba(0,210,255,0.5)' }}>
                        GLOBAL MARKET PULSE
                    </h1>
                    <div style={{ fontSize: 24, opacity: 0.6 }}>SYSTEM_NODE_0x82: ACTIVE // 4K_UHD_STREAM</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 40, fontWeight: 'bold', color: '#00d2ff' }}>
                    LIVE: {new Date().toLocaleTimeString('en-GB', { hour12: false })}
                </div>
            </div>

            {/* Main Visual Layout */}
            <div style={{ display: 'flex', padding: '220px 80px 80px', height: '100%', gap: 60 }}>

                {/* B. Floating Overlays (Sisi Kiri: Tickers) */}
                <div style={{ width: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {['BTC/USD', 'ETH/USDT', 'SOL/USD', 'GOLD/XAU', 'NAS100'].map((pair, i) => {
                        const val = 52000 + Math.sin(phase + i) * 1500;
                        const isUp = Math.sin(phase + i) > 0;
                        return (
                            <div key={pair} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: 30, borderRadius: 12 }}>
                                <div style={{ fontSize: 28, opacity: 0.5 }}>{pair}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div style={{ fontSize: 48, fontWeight: 'bold' }}>{val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    <div style={{ color: isUp ? '#00ff88' : '#ff3366', fontSize: 32 }}>{isUp ? '▲' : '▼'} {(Math.abs(Math.sin(phase + i)) * 2).toFixed(2)}%</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* A. Central Candlestick Chart */}
                <div style={{ flex: 1, position: 'relative', background: 'rgba(0,0,0,0.3)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <svg width="100%" height="100%" viewBox="0 0 2000 1200" preserveAspectRatio="none">
                        {/* Render Moving Average Line */}
                        <path
                            d={maPath}
                            fill="none"
                            stroke="#00d2ff"
                            strokeWidth={6}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ filter: 'url(#neonGlow)', opacity: 0.8 }}
                        />

                        {candleData.map((stats, i) => {
                            const c = candles[i];
                            const x = (i / candleCount) * 1900 + 50;
                            const color = stats.isBullish ? '#00ff88' : '#ff3366';

                            return (
                                <g key={c.id} style={{ filter: 'url(#neonGlow)' }}>
                                    {/* Shadow/Wick */}
                                    <line x1={x + 15} y1={stats.high} x2={x + 15} y2={stats.low} stroke={color} strokeWidth={4} />
                                    {/* Body */}
                                    <rect
                                        x={x}
                                        y={Math.min(stats.open, stats.close)}
                                        width={30}
                                        height={Math.max(Math.abs(stats.open - stats.close), 6)}
                                        fill={color}
                                    />
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* B. Sisi Kanan: Order Book (Berdenyut) */}
                <div style={{ width: 500, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 24, color: '#ff3366', marginBottom: 10, fontWeight: 'bold' }}>SELL ORDERS (LIVE)</div>
                    {[...Array(14)].map((_, i) => {
                        // Pulse effect setiap 1 detik mengikuti 60 FPS
                        const pulse = interpolate(Math.sin(phase * 10 + i), [-1, 1], [0.4, 1]);
                        const widthPct = (random(`order-${i}`) * 60 + 20);
                        return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', height: 42, opacity: pulse }}>
                                <div style={{ flex: 1, background: 'rgba(255, 51, 102, 0.1)', height: '100%', position: 'relative' }}>
                                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${widthPct}%`, background: 'rgba(255, 51, 102, 0.4)' }} />
                                    <div style={{ position: 'absolute', left: 15, top: 10, fontSize: 22 }}>{(65200 + i * 2.5).toFixed(1)}</div>
                                </div>
                                <div style={{ width: 120, textAlign: 'right', fontSize: 22, marginLeft: 15 }}>{(random(i + Math.floor(frame / 10)) * 2).toFixed(4)}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* B. Bawah: Terminal Log Transaksi */}
            <div style={{ position: 'absolute', bottom: 40, left: 80, right: 80, height: 160, background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(0,210,255,0.2)', padding: '20px 40px', overflow: 'hidden' }}>
                <div style={{ transform: `translateY(-${(frame * 3) % 400}px)` }}>
                    {[...Array(30)].map((_, i) => (
                        <div key={i} style={{ color: '#00d2ff', fontSize: 20, opacity: 0.6, marginBottom: 8 }}>
                            [{new Date().toISOString()}] TRANSACTION_ID: 0x{random(i + Math.floor(frame / 60)).toString(16).slice(2, 18).toUpperCase()} ... <span style={{ color: '#00ff88' }}>SUCCESS</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Overlay Film Grain untuk kesan Premium */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.04,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none'
            }} />
        </AbsoluteFill>
    );
};