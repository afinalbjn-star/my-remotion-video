import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    random,
} from 'remotion';

// ============================================================
// KONFIGURASI VIDEO
// ============================================================
export const VIDEO_CONFIG = {
    width: 3840,      // 4K width
    height: 2160,     // 4K height
    fps: 60,          // 60 FPS
    durationInFrames: 900, // 15 detik x 60 fps = 900 frame
} as const;

const LOOP_FRAMES = VIDEO_CONFIG.durationInFrames; // 900

// Helper: nilai loop seamless (0 -> 2π selama 1 putaran penuh)
const loopAngle = (frame: number, cycles = 1) =>
    (frame / LOOP_FRAMES) * Math.PI * 2 * cycles;

// ============================================================
// LAYER 1: GRADIENT BACKGROUND BERGERAK (Aurora)
// ============================================================
const AuroraGradient: React.FC = () => {
    const frame = useCurrentFrame();
    const t = loopAngle(frame, 1);

    // Pergeseran hue seamless (kembali ke posisi awal di akhir)
    // Menggunakan interpolate untuk memastikan transisi hue yang lebih halus dari 0 ke 360
    const hueShift = interpolate(frame, [0, LOOP_FRAMES], [0, 360], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const x1 = 50 + Math.sin(t) * 30;
    const y1 = 50 + Math.cos(t) * 30;
    const x2 = 50 - Math.sin(t * 2) * 35;
    const y2 = 50 - Math.cos(t * 1) * 35;

    return (
        <AbsoluteFill
            style={{
                background: `
          radial-gradient(circle at ${x1}% ${y1}%, hsl(${(260 + hueShift) % 360}, 80%, 30%) 0%, transparent 55%),
          radial-gradient(circle at ${x2}% ${y2}%, hsl(${(190 + hueShift) % 360}, 90%, 35%) 0%, transparent 55%),
          radial-gradient(circle at 50% 50%, hsl(${(310 + hueShift) % 360}, 70%, 20%) 0%, transparent 70%),
          #05060f
        `,
            }}
        />
    );
};

// ============================================================
// LAYER 2: GRID PERSPEKTIF BERGERAK
// ============================================================
const PerspectiveGrid: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // Pergeseran grid yang seamless (looping per ukuran sel)
    const cell = 160;
    const offset = (frame / LOOP_FRAMES) * cell; // bergeser tepat 1 sel per loop

    const lines: React.ReactNode[] = [];
    const cols = Math.ceil(width / cell) + 1;
    const rows = Math.ceil(height / cell) + 1;

    for (let i = -1; i <= cols; i++) {
        const x = i * cell - offset;
        lines.push(
            <line
                key={`v${i}`}
                x1={x}
                y1={0}
                x2={x}
                y2={height}
                stroke="rgba(120,200,255,0.08)"
                strokeWidth={2}
            />
        );
    }
    for (let j = -1; j <= rows; j++) {
        const y = j * cell + offset;
        lines.push(
            <line
                key={`h${j}`}
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke="rgba(120,200,255,0.08)"
                strokeWidth={2}
            />
        );
    }

    return (
        <AbsoluteFill>
            <svg width={width} height={height}>
                {lines}
            </svg>
        </AbsoluteFill>
    );
};

// ============================================================
// LAYER 3: PARTIKEL MELAYANG (banyak, sistematis, looping)
// ============================================================
const Particles: React.FC<{ count?: number }> = ({ count = 220 }) => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    const particles = new Array(count).fill(0).map((_, i) => {
        const seedX = random(`px-${i}`);
        const seedY = random(`py-${i}`);
        const seedR = random(`pr-${i}`);
        const seedS = random(`ps-${i}`);

        const baseX = seedX * width;
        const baseY = seedY * height;
        const radius = 2 + seedR * 6;
        // Kecepatan harus bilangan bulat agar posisi awal dan akhir sinkron (looping)
        const speed = Math.floor(1 + seedS * 3);

        // Gerakan orbital seamless
        const t = loopAngle(frame, speed);
        const orbit = 40 + seedR * 120;
        const x = (baseX + Math.cos(t + i) * orbit + width) % width;
        const y = (baseY + Math.sin(t + i * 0.7) * orbit + height) % height;

        const opacity = interpolate(
            Math.sin(t * 2 + i),
            [-1, 1],
            [0.15, 0.9]
        );
        const hue = (200 + seedR * 160) % 360;

        return { x, y, radius, opacity, hue, key: i };
    });

    return (
        <AbsoluteFill>
            <svg width={width} height={height}>
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {particles.map((p) => (
                    <circle
                        key={p.key}
                        cx={p.x}
                        cy={p.y}
                        r={p.radius}
                        fill={`hsl(${p.hue}, 90%, 70%)`}
                        opacity={p.opacity}
                        filter="url(#glow)"
                    />
                ))}
            </svg>
        </AbsoluteFill>
    );
};

// ============================================================
// LAYER 4: GELOMBANG SINUS BERLAPIS (flowing waves)
// ============================================================
const FlowingWaves: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    const waveCount = 5;
    const waves: React.ReactNode[] = [];

    for (let w = 0; w < waveCount; w++) {
        // Cycles harus bilangan bulat (e.g. 1, 2, 3...) agar gelombang berakhir di titik yang sama dengan titik awal
        const t = loopAngle(frame, 1 + w);
        const amplitude = 120 + w * 60;
        const yBase = height * (0.35 + w * 0.13);
        const points: string[] = [];
        const step = 40;

        for (let x = 0; x <= width; x += step) {
            const phase = (x / width) * Math.PI * 4;
            const y =
                yBase +
                Math.sin(phase + t) * amplitude +
                Math.cos(phase * 0.5 + t * 2) * (amplitude * 0.4);
            points.push(`${x},${y}`);
        }

        const path = `M ${points.join(' L ')} L ${width},${height} L 0,${height} Z`;
        const hue = (240 + w * 25) % 360;

        waves.push(
            <path
                key={w}
                d={path}
                fill={`hsla(${hue}, 80%, 50%, 0.06)`}
                stroke={`hsla(${hue}, 90%, 70%, 0.25)`}
                strokeWidth={2}
            />
        );
    }

    return (
        <AbsoluteFill style={{ mixBlendMode: 'screen' }}>
            <svg width={width} height={height}>
                {waves}
            </svg>
        </AbsoluteFill>
    );
};

// ============================================================
// LAYER 5: CINCIN GEOMETRIS BERPUTAR (di tengah)
// ============================================================
const RotatingRings: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    const cx = width / 2;
    const cy = height / 2;

    const ringCount = 8;
    const rings: React.ReactNode[] = [];

    for (let r = 0; r < ringCount; r++) {
        const t = loopAngle(frame, r % 2 === 0 ? 1 : -1); // arah bergantian
        const radius = 200 + r * 130;
        const segments = 12 + r * 2;
        const dash = (2 * Math.PI * radius) / segments;
        const rotation = (t * 180) / Math.PI;
        const hue = (180 + r * 30) % 360;

        rings.push(
            <circle
                key={r}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={`hsla(${hue}, 90%, 65%, ${0.4 - r * 0.03})`}
                strokeWidth={3}
                strokeDasharray={`${dash * 0.5} ${dash * 0.5}`}
                transform={`rotate(${rotation} ${cx} ${cy})`}
            />
        );
    }

    return (
        <AbsoluteFill style={{ mixBlendMode: 'screen' }}>
            <svg width={width} height={height}>
                {rings}
            </svg>
        </AbsoluteFill>
    );
};

// ============================================================
// LAYER 6: VIGNETTE & NOISE OVERLAY
// ============================================================
const Vignette: React.FC = () => (
    <AbsoluteFill
        style={{
            background:
                'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)',
            pointerEvents: 'none',
        }}
    />
);

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export const AnimatedBackground: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#05060f' }}>
            <AuroraGradient />
            <PerspectiveGrid />
            <FlowingWaves />
            <Particles count={220} />
            <RotatingRings />
            <Vignette />
        </AbsoluteFill>
    );
};