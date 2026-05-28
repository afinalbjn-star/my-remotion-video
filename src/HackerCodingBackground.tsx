import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';

const NUM_COLUMNS = 50; // Menambah kepadatan kolom untuk 4K

// Kumpulan potongan kode untuk memberikan kesan "Hacker/Vibecoding"
const CODE_SNIPPETS = [
    'git push origin master --force',
    'sudo rm -rf /cache/old_logs',
    '0x7FFD4A2B1088 >> STACK_TRACE',
    'const data = await fetch("/api/v1/auth")',
    'docker-compose up -d --build',
    'python3 main.py --env production',
    'ssh root@192.168.1.105',
    'DECRYPTING_RSA_2048_STREAM...',
    'void* ptr = malloc(sizeof(payload));',
    'npm install --save-dev typescript',
    'SELECT * FROM users WHERE role="admin"',
    '10110100 11010010 10001111',
    'chmod +x exploit.sh',
    'iptables -A INPUT -p tcp --dport 80 -j ACCEPT',
    'System.out.println("Handshake...");',
    'curl -X POST https://api.internal/gate',
    'OVERRIDING_SYSTEM_KERNELS...',
    'SCANNING_PORT_8080...',
    'TUNNEL_ESTABLISHED_PORT_443',
];

// Potongan kode merah (Error/Danger)
const DANGER_SNIPPETS = [
    '[ERROR] CONNECTION TERMINATED',
    'CRITICAL: KERNEL PANIC',
    'UNAUTHORIZED ACCESS DETECTED',
    'DELETING DATABASE...',
    '0x00000000 (NULL_POINTER_EXCEP)',
    'FATAL_SYSTEM_ERROR: SHUTDOWN',
    'BREACH_DETECTED: IP_LOGGED',
];

const CodingColumn: React.FC<{
    columnIndex: number;
    width: number;
    height: number;
    progress: number;
}> = ({ columnIndex, width, height, progress }) => {
    const seed = columnIndex * 99.7;

    // Mengacak properti kolom
    const columnData = useMemo(() => {
        // Menentukan warna kolom terlebih dahulu
        const colorRand = random(seed + 4);
        let hue = 120; // Default: Matrix Green
        if (colorRand > 0.85) hue = 0; // 15% Merah (Hacker Alert)
        else if (colorRand > 0.6) hue = 190; // 25% Cyan/Blue

        // Meningkatkan baris menjadi 100 agar melebihi tinggi 4K (Seamless fix)
        const lines = new Array(100).fill(0).map((_, i) => {
            const pool = hue === 0 && random(seed + i) > 0.5 ? DANGER_SNIPPETS : CODE_SNIPPETS;
            return pool[Math.floor(random(seed + i + 1) * pool.length)];
        });

        return {
            x: (columnIndex / NUM_COLUMNS) * width,
            // Speed harus integer (1, 2, atau 3) untuk looping sempurna
            speed: Math.floor(random(seed + 1) * 3) + 1,
            opacity: random(seed + 2) * 0.5 + 0.2,
            lines,
            fontSize: interpolate(random(seed + 3), [0, 1], [20, 36]),
            colorHue: hue,
            spacing: interpolate(random(seed + 5), [0, 1], [30, 45]),
        };
    }, [columnIndex, width, seed]);

    const totalTextHeight = columnData.lines.length * columnData.spacing;

    // Pergerakan vertikal yang seamless
    const yOffset = (progress * columnData.speed * totalTextHeight) % totalTextHeight;

    return (
        <g opacity={columnData.opacity}>
            {/* Kita render dua set teks untuk memastikan looping visual tanpa jeda */}
            {[0, 1].map((set) => (
                <g key={set} transform={`translate(${columnData.x}, ${yOffset + (set * -totalTextHeight)})`}>
                    {columnData.lines.map((line, i) => (
                        <text
                            key={i}
                            y={i * columnData.spacing}
                            fill={`hsl(${columnData.colorHue}, 100%, ${columnData.colorHue === 0 ? '60%' : '75%'})`}
                            fontSize={columnData.fontSize}
                            fontFamily="JetBrains Mono, Courier New, monospace"
                            fontWeight="bold"
                            style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
                        >
                            {line}
                        </text>
                    ))}
                </g>
            ))}
        </g>
    );
};

export const HackerCodingBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const progress = frame / durationInFrames;

    return (
        <AbsoluteFill style={{ backgroundColor: '#020617', overflow: 'hidden' }}>
            {/* Background Grid Subtle */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'linear-gradient(to right, rgba(0, 255, 65, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 65, 0.05) 1px, transparent 1px)',
                backgroundSize: '80px 80px',
            }} />

            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="black" stopOpacity="1" />
                        <stop offset="15%" stopColor="black" stopOpacity="0" />
                        <stop offset="85%" stopColor="black" stopOpacity="0" />
                        <stop offset="100%" stopColor="black" stopOpacity="1" />
                    </linearGradient>

                    <filter id="hackerGlow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                <g filter="url(#hackerGlow)">
                    {new Array(NUM_COLUMNS).fill(0).map((_, i) => (
                        <CodingColumn
                            key={i}
                            columnIndex={i}
                            width={width}
                            height={height}
                            progress={progress}
                        />
                    ))}
                </g>

                {/* Masking untuk efek fade di atas dan bawah layar agar teks tidak terpotong tajam */}
                <rect width={width} height={height} fill="url(#fadeGradient)" pointerEvents="none" />
            </svg>

            {/* Scanlines Effect */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 4px, 3px 100%',
                pointerEvents: 'none'
            }} />

            {/* Vignette Pop Art */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%)',
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};