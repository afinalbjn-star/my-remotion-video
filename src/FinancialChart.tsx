import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import data from './marketData.json';
import { Candle } from './Candle';

export const FinancialChart: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Pengaturan grafik
    const candleWidth = 40;
    const gap = 20;
    const chartPadding = 40; // Mengurangi padding agar grafik mengisi lebih banyak ruang vertikal
    const candleStep = candleWidth + gap;

    // TEKNIK SEAMLESS: Mirroring data agar titik awal dan akhir bertemu di harga yang sama
    // Perbaikan: Menukar open/close pada data yang dibalik agar warna lilin sesuai arah tren (merah saat turun)
    const mirroredData = useMemo(() => [
        ...data,
        ...data.slice(1, -1).reverse().map(d => ({
            ...d,
            open: d.close,
            close: d.open
        }))
    ], []);

    const allPrices = mirroredData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...allPrices) - 1; // Mempersempit buffer harga agar fluktuasi terlihat sangat tajam
    const maxPrice = Math.max(...allPrices) + 1;

    const yScale = (price: number) => {
        return interpolate(
            price,
            [minPrice, maxPrice],
            [height - chartPadding, chartPadding]
        );
    };

    // Hitung total lebar satu siklus penuh mirrored data
    const totalWidth = mirroredData.length * candleStep;

    // Pastikan scrollOffset memetakan tepat satu siklus mirroredData
    const scrollOffset = interpolate(frame, [0, durationInFrames], [0, totalWidth]);

    // Titik fokus harga lebih ke tengah untuk estetika
    const focusX = width * 0.7;

    // Cari candle yang sedang berada di titik fokus
    const absoluteFocusX = (scrollOffset + focusX) % totalWidth;
    const currentCandleIndex = Math.floor(absoluteFocusX / candleStep);
    const currentCandle = mirroredData[currentCandleIndex];

    const currentPrice = currentCandle.close;
    const currentY = yScale(currentPrice);

    return (
        <AbsoluteFill style={{ backgroundColor: '#020617', color: 'white', fontFamily: 'sans-serif' }}>
            {/* Background Grid */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: `radial-gradient(circle, #475569 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

            <svg width={width} height={height}>
                <g transform={`translate(${-scrollOffset}, 0)`}>
                    {/* Render 4 set data mirrored agar tidak ada gap kosong di resolusi 1080p/4K */}
                    {[...mirroredData, ...mirroredData, ...mirroredData, ...mirroredData].map((d, i) => (
                        <Candle
                            key={i}
                            open={d.open}
                            high={d.high}
                            low={d.low}
                            close={d.close}
                            width={candleWidth}
                            x={i * candleStep}
                            yScale={yScale}
                        />
                    ))}
                </g>

                {/* Current Price Line */}
                <line
                    x1={0}
                    y1={currentY}
                    x2={width}
                    y2={currentY}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={2}
                    strokeDasharray="5,5"
                />
            </svg>

            {/* Price Tag Overlay */}
            <div style={{
                position: 'absolute',
                left: focusX + 20,
                top: currentY - 25,
                backgroundColor: currentPrice >= currentCandle.open ? '#22c55e' : '#ef4444',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '24px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}>
                ${currentPrice.toFixed(2)}
            </div>

            {/* Header Info */}
            <div style={{ position: 'absolute', top: 60, left: 60 }}>
                <div style={{ fontSize: 40, fontWeight: 'bold', letterSpacing: 2 }}>BTC / USDT</div>
                <div style={{ fontSize: 20, color: '#94a3b8', marginTop: 5 }}>MARKET VOLATILITY INDEX</div>
            </div>
        </AbsoluteFill>
    );
};