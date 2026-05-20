import React from 'react';

interface CandleProps {
    open: number;
    high: number;
    low: number;
    close: number;
    x: number;
    width: number;
    yScale: (price: number) => number;
}

export const Candle: React.FC<CandleProps> = ({ open, high, low, close, x, width, yScale }) => {
    const isBullish = close >= open;
    const color = isBullish ? '#22c55e' : '#ef4444';

    const top = yScale(Math.max(open, close));
    const bottom = yScale(Math.min(open, close));
    const bodyHeight = Math.max(bottom - top, 2); // Minimal 2px agar terlihat

    const wickTop = yScale(high);
    const wickBottom = yScale(low);

    return (
        <g>
            {/* Wick (Garis tipis atas-bawah) */}
            <line
                x1={x + width / 2}
                y1={wickTop}
                x2={x + width / 2}
                y2={wickBottom}
                stroke={color}
                strokeWidth={2}
            />
            {/* Body (Kotak open-close) */}
            <rect
                x={x}
                y={top}
                width={width}
                height={bodyHeight}
                fill={color}
                rx={2}
                style={{
                    filter: `drop-shadow(0 0 10px ${color}44)`
                }}
            />
        </g>
    );
};