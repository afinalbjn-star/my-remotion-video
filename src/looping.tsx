import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    Easing,
    random,
} from 'remotion';
import data from './marketData.json';

// Sub-komponen Candle untuk efisiensi render
const Candle: React.FC<{
    open: number;
    close: number;
    high: number;
    low: number;
    x: number;
    width: number;
    yScale: (p: number) => number;
}> = ({ open, close, high, low, x, width, yScale }) => {
    const color = close >= open ? '#22c55e' : '#ef4444';
    const yOpen = yScale(open);
    const yClose = yScale(close);
    const bodyHeight = Math.max(Math.abs(yOpen - yClose), 4);
    return (
        <g>
            <line
                x1={x + width / 2}
                y1={yScale(high)}
                x2={x + width / 2}
                y2={yScale(low)}
                stroke={color}
                strokeWidth={3}
            />
            <rect
                x={x}
                y={yOpen < yClose ? yOpen : yClose}
                width={width}
                height={bodyHeight}
                fill={color}
                rx={4}
                style={{
                    filter: `drop-shadow(0 0 15px ${color}66)`,
                }}
            />
            <rect x={x} y={yOpen < yClose ? yOpen : yClose} width={width} height={bodyHeight} fill="white" opacity={0.1} rx={4} />
        </g>
    );
};

export const LoopingDashboard: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Konfigurasi Visual
    const candleWidth = 120;
    const gap = 60;
    const step = candleWidth + gap;
    const volumeHeight = 500;

    // Teknik Seamless Mirroring
    const mirroredData = useMemo(() => [
        ...data,
        ...data.slice(1, -1).reverse().map(d => ({ ...d, open: d.close, close: d.open }))
    ], []);

    const allPrices = mirroredData.flatMap(d => [d.high, d.low]);
    const minP = Math.min(...allPrices) - 100;
    const maxP = Math.max(...allPrices) + 100;
    const maxVol = Math.max(...mirroredData.map(d => d.volume));

    const yScale = (p: number) => interpolate(p, [minP, maxP], [height - 800, 500]);

    const totalWidth = mirroredData.length * step;
    const scrollOffset = (frame / durationInFrames) * totalWidth;

    // Market Ticker Loop
    const tickerItems = ['ETH $2,450.20 ▲1.2%', 'SOL $145.10 ▲5.4%', 'XRP $0.62 ▼0.5%', 'ADA $0.45 ▲0.1%', 'DOT $7.20 ▼1.1%'];
    const tickerWidth = 800;
    const tickerOffset = (frame * 0.4) % (tickerItems.length * tickerWidth);

    // Camera Dynamics
    const cameraSwayX = Math.sin(frame * 0.004) * 40;
    const cameraSwayY = Math.cos(frame * 0.003) * 30;
    const cameraZoom = interpolate(Math.sin(frame * 0.002), [-1, 1], [0.98, 1.02]);
    const rotation = interpolate(Math.sin(frame * 0.002), [-1, 1], [-0.3, 0.3]);

    const glitch = random(`glitch-${frame}`) > 0.98 ? 5 : 0;

    // Indikator Moving Average (Smooth Line)
    const maPoints = useMemo(() => {
        const period = 5;
        return mirroredData.map((_, i) => {
            const start = Math.max(0, i - period);
            const avg = mirroredData.slice(start, i + 1).reduce((s, d) => s + d.close, 0) / (i - start + 1);
            return { x: i * step + candleWidth / 2, y: yScale(avg) };
        });
    }, [mirroredData, step]);

    // Partikel Latar Belakang (Depth of Field)
    const particles = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: random(`x-${i}`) * width,
        y: random(`y-${i}`) * height,
        size: random(`s-${i}`) * 20 + 4,
        speed: (random(`sp-${i}`) * 1 + 0.5) * 0.15,
        z: random(`z-${i}`) * 10,
    })), [width, height]);

    // Current Price Indicator (at 75% width)
    const focusX = width * 0.75;
    const currentDataIndex = Math.floor(((scrollOffset + focusX) % totalWidth) / step);
    const currentPrice = mirroredData[currentDataIndex % mirroredData.length].close;
    const currentY = yScale(currentPrice);

    return (
        <AbsoluteFill style={{ backgroundColor: '#010409', fontFamily: 'Inter, sans-serif', color: 'white', overflow: 'hidden' }}>
            {/* 0. Technical Overlays (Noise & Scanlines) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                pointerEvents: 'none',
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }} />
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 20,
                pointerEvents: 'none',
                background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
                backgroundSize: '100% 3px',
            }} />

            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </svg>

            {/* 1. 3D Perspective Grid Background */}
            <div
                style={{
                    position: 'absolute',
                    width: '200%',
                    height: '200%',
                    top: '10%',
                    left: '-50%',
                    backgroundImage: `linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '200px 200px',
                    transform: `perspective(1000px) rotateX(65deg) translateY(${(frame * 0.25) % 200}px)`,
                    maskImage: 'linear-gradient(to bottom, transparent, black 40%, black 100%)',
                }}
            />

            {/* 1.1 Top Market Ticker */}
            <div style={{
                position: 'absolute',
                top: 0,
                width: '100%',
                height: 120,
                background: 'rgba(59, 130, 246, 0.05)',
                borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
            }}>
                <div style={{ display: 'flex', transform: `translateX(${-tickerOffset}px)` }}>
                    {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
                        <div key={i} style={{ width: tickerWidth, fontSize: 36, color: item.includes('▲') ? '#22c55e' : '#ef4444', fontWeight: 'bold', letterSpacing: 4 }}>{item}</div>
                    ))}
                </div>
            </div>

            {/* 2. Particles with depth */}
            {particles.map(p => {
                const yPos = (p.y - frame * p.speed) % height;
                return (
                    <div key={p.id} style={{
                        position: 'absolute',
                        left: p.x,
                        top: yPos < 0 ? yPos + height : yPos,
                        width: p.size,
                        height: p.size,
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                        filter: `blur(${p.z * 2}px)`,
                        opacity: interpolate(p.z, [0, 10], [0.4, 0.1]),
                    }} />
                );
            })}

            {/* 3. Main Chart with Camera Dynamics */}
            <div style={{
                transform: `scale(${cameraZoom}) translate(${cameraSwayX + glitch * 2}px, ${cameraSwayY}px) rotate(${rotation}deg)`,
                width: '100%',
                height: '100%',
            }}>
                <svg width={width} height={height} style={{ overflow: 'visible' }}>
                    <g transform={`translate(${-scrollOffset}, 0)`}>
                        {[0, 1, 2].map(iter => (
                            <g key={iter} transform={`translate(${iter * totalWidth}, 0)`}>
                                {/* Volume Bars */}
                                {mirroredData.map((d, i) => (
                                    <rect
                                        key={`v-${i}`}
                                        x={i * step}
                                        y={height - (d.volume / maxVol) * volumeHeight - 100}
                                        width={candleWidth}
                                        height={(d.volume / maxVol) * volumeHeight}
                                        fill={d.close >= d.open ? '#22c55e' : '#ef4444'}
                                        opacity={0.1}
                                        rx={2}
                                    />
                                ))}
                                {/* MA Line */}
                                <path
                                    d={`M ${maPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    opacity={0.4}
                                    strokeLinejoin="round"
                                    filter="url(#glow)"
                                />
                                {/* Candles */}
                                {mirroredData.map((d, i) => <Candle key={i} {...d} x={i * step} width={candleWidth} yScale={yScale} />)}
                            </g>
                        ))}
                    </g>

                    {/* Price Focus Line */}
                    <line
                        x1={0} y1={currentY} x2={width} y2={currentY}
                        stroke="rgba(255,255,255,0.2)"
                        strokeDasharray="10 10"
                        strokeWidth={4}
                    />
                    <circle cx={focusX} cy={currentY} r={16} fill="white" filter="url(#glow)" />
                </svg>
            </div>

            {/* 4. Glassmorphism UI Panels */}
            <div style={{ position: 'absolute', top: 240, left: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
                    <div style={{
                        padding: '80px 100px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: 60,
                        border: '2px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.3)',
                    }}>
                        <h2 style={{ fontSize: 80, margin: 0, color: '#94a3b8' }}>BTC / USDT</h2>
                        <div style={{ fontSize: 200, fontWeight: 900, letterSpacing: -8, fontVariantNumeric: 'tabular-nums' }}>
                            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: 60, color: '#22c55e', fontWeight: 600 }}>▲ +5.24% (24H)</div>
                    </div>
                </div>
            </div>

            {/* 4.1 Corner Micro-UI elements */}
            <div style={{ position: 'absolute', top: 240, right: 240, textAlign: 'right', fontSize: 28, color: '#3b82f6', opacity: 0.6, letterSpacing: 4 }}>
                <div>COORD_X: {cameraSwayX.toFixed(4)}</div>
                <div>COORD_Y: {cameraSwayY.toFixed(4)}</div>
                <div>BUFFER_STATE: STABLE</div>
                <div>HEX_VAL: 0x{Math.floor(currentPrice).toString(16).toUpperCase()}</div>
            </div>

            {/* 5. Bottom Status Bar */}
            <div style={{ position: 'absolute', bottom: 200, right: 240, textAlign: 'right' }}>
                <div style={{
                    padding: '40px 80px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: 40,
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    backdropFilter: 'blur(12px)',
                }}>
                    <div style={{ fontSize: 40, color: '#3b82f6', fontWeight: 'bold', letterSpacing: 8 }}>STOK VIDEO PREMIUM</div>
                    <div style={{ fontSize: 28, color: '#94a3b8', marginTop: 10 }}>3840x2160 | 60FPS | SEAMLESS LOOP</div>
                </div>
            </div>

            {/* Cinematic Vignette */}
            <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 500px rgba(0,0,0,0.9)', pointerEvents: 'none' }} />

            {/* Side Pulse Decoration */}
            <div style={{
                position: 'absolute',
                left: 80,
                top: '50%',
                height: '40%',
                width: 8,
                background: `linear-gradient(to bottom, transparent, #3b82f6, transparent)`,
                opacity: interpolate(Math.sin(frame * 0.02), [-1, 1], [0.2, 0.8]),
            }} />
        </AbsoluteFill>
    );
};