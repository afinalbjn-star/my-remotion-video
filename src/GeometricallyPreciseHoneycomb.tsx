import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    Easing
} from 'remotion';
import React, { useMemo } from 'react';

// --- KONFIGURASI DIMENSI ULTRA HD 4K ---
const CANVAS_WIDTH = 3840;
const CANVAS_HEIGHT = 2160;

// Ukuran hexagon disesuaikan agar proporsional menutupi layar 4K
const HEX_RADIUS = 150;
const HEX_WIDTH = HEX_RADIUS * Math.sqrt(3);
const HEX_HEIGHT = HEX_RADIUS * 2;

// Menambahkan padding grid (+3) untuk memastikan tidak ada celah kosong di ujung layar
const COLS = Math.ceil(CANVAS_WIDTH / HEX_WIDTH) + 3;
const ROWS = Math.ceil(CANVAS_HEIGHT / (HEX_HEIGHT * 0.75)) + 3;

interface HexagonItem {
    key: string;
    centerX: number;
    centerY: number;
    wavePhase: number;
}

export const GeometricallyPreciseHoneycomb: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // --- 1. MEMBANGUN GRID GEOMETRI TOTAL (FULL COVERAGE) ---
    const hexagons: HexagonItem[] = useMemo(() => {
        const list: HexagonItem[] = [];
        const centerX_Screen = CANVAS_WIDTH / 2;
        const centerY_Screen = CANVAS_HEIGHT / 2;

        // Memulai index dari -2 untuk membuang celah kosong di tepi kiri dan atas kanvas
        for (let r = -2; r < ROWS; r++) {
            for (let q = -2; q < COLS; q++) {
                const xOffset = r % 2 === 0 ? 0 : HEX_WIDTH / 2;
                const x = q * HEX_WIDTH + xOffset;
                const y = r * (HEX_HEIGHT * 0.75);

                // Jarak dari pusat layar digunakan sebagai acuan gerak rambat radial
                const distanceToCenter = Math.sqrt(
                    Math.pow(x - centerX_Screen, 2) + Math.pow(y - centerY_Screen, 2)
                );

                list.push({
                    key: `hex-grid-${q}-${r}`,
                    centerX: x,
                    centerY: y,
                    // Fase ombak diikat secara radial matematika agar aliran ombak selaras
                    wavePhase: (distanceToCenter / 700) * Math.PI * 2,
                });
            }
        }
        return list;
    }, []);

    // --- 2. LOGIKA UTAMA SEAMLESS LOOPING ---
    // Agar loop sempurna dari frame awal hingga akhir, nilai sudut perputaran (loopAngle)
    // harus menyelesaikan satu siklus lingkaran penuh (2 * Math.PI) tepat di akhir durasi video.
    const loopProgress = frame / durationInFrames;
    const loopAngle = loopProgress * Math.PI * 2;

    // Token warna monokromatik biru-putih premium sesuai foto referensi
    const colors = {
        shadowFloor: '#cfe3ee',  // Dasar terdalam (bayangan)
        hexTop: '#ffffff',       // Warna konstan sisi atas
        hexWallLight: '#badbeb', // Dinding pantulan cahaya utama
        hexWallDark: '#95c3dc',  // Dinding area bayangan dalam
    };

    return (
        <AbsoluteFill style={{ backgroundColor: colors.shadowFloor }}>
            {/* Efek gradasi cahaya global dari sudut kiri atas untuk memperkuat kesan 3D */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 5
            }} />

            <svg
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                <defs>
                    {/* Drop shadow lembut untuk kedalaman antar layer hexagon */}
                    <filter id="smooth-honeycomb-shadow" x="-40%" y="-40%" width="180%" height="180%">
                        <feDropShadow
                            dx="-3"
                            dy="12"
                            stdDeviation="15"
                            floodColor="#567f96"
                            floodOpacity="0.32"
                        />
                    </filter>
                </defs>

                {hexagons.map((hex) => {
                    // --- 4. FORMULA GERAKAN OMBAK (WAVE INTERPOLATION) ---
                    // Amplitudo gerakan naik turun diatur pada angka 40px agar tidak terlalu ekstrem
                    const waveMovement = Math.sin(loopAngle - hex.wavePhase) * 40;

                    // Sekarang posisi vertikal hanya dipengaruhi oleh ombak untuk hasil seamless
                    const currentVerticalDisplacement = waveMovement;

                    const scaleFactor = 1; // Skala tetap penuh

                    // --- 5. KALKULASI TITIK VEKTOR 2D UNTUK PERMUKAAN ATAS ---
                    const pointsArray: [number, number][] = Array.from({ length: 6 }).map((_, i) => {
                        const angleRad = (Math.PI / 180) * (60 * i);
                        const vx = hex.centerX + HEX_RADIUS * Math.cos(angleRad) * scaleFactor;
                        // Koordinat Y digabungkan dengan perpindahan posisi vertikal ombak dinamis
                        const vy = hex.centerY + HEX_RADIUS * Math.sin(angleRad) * scaleFactor + currentVerticalDisplacement;
                        return [vx, vy];
                    });

                    const pointsString = pointsArray.map(p => p.join(',')).join(' ');

                    // --- 6. PENCAHAYAAN DINAMIS (DYNAMIC SHADING) ---
                    // Sisi atas akan sedikit meredup saat turun ke bawah, memberikan efek realisme foto yang kuat
                    const topFaceOpacity = interpolate(waveMovement, [-40, 40], [0.93, 1.0]);
                    const wallColorShade = interpolate(waveMovement, [-40, 40], [0.88, 1.05]);

                    return (
                        <g
                            key={hex.key}
                            filter="url(#smooth-honeycomb-shadow)"
                        >
                            {/* LAYER 3D EXTRUSION WALLS (DINDING ELEVASI SAMPING) */}
                            {pointsArray.map((p, idx) => {
                                const nextIdx = (idx + 1) % 6;
                                const pNext = pointsArray[nextIdx];

                                // Hanya merender dinding poligon yang menghadap ke arah depan (sudut bawah visual)
                                if (idx >= 0 && idx <= 3) {
                                    // Ketebalan dinding samping dibuat konstan setinggi 45px
                                    const wallPathData = `M ${p[0]} ${p[1]} L ${pNext[0]} ${pNext[1]} L ${pNext[0]} ${pNext[1] + 45} L ${p[0]} ${p[1] + 45} Z`;
                                    const baseWallColor = idx === 1 || idx === 2 ? colors.hexWallLight : colors.hexWallDark;

                                    return (
                                        <path
                                            key={`wall-segment-${idx}`}
                                            d={wallPathData}
                                            fill={baseWallColor}
                                            fillOpacity={wallColorShade}
                                        />
                                    );
                                }
                                return null;
                            })}

                            {/* FLAT GLOSSY TOP FACES (PERMUKAAN ATAS PUTIH) */}
                            <polygon
                                points={pointsString}
                                fill={colors.hexTop}
                                fillOpacity={topFaceOpacity}
                                stroke="#ffffff"
                                strokeWidth="3"
                                strokeLinejoin="round"
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Efek Vignette di sekeliling frame video untuk memfokuskan pandangan mata ke tengah */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                boxShadow: 'inset 0 0 300px rgba(86, 127, 150, 0.3)',
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};