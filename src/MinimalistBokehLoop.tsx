import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

/**
 * DEFINISI ANTARMUKA (INTERFACES)
 * Menjaga struktur data objek partikel tetap konsisten selama proses kompilasi.
 */
interface BokehParticle {
    id: number;
    basePercentX: number; // Menggunakan persentase agar adaptif di semua ukuran layar
    basePercentY: number; // Menggunakan persentase agar adaptif di semua ukuran layar
    size: number;
    radiusX: number;
    radiusY: number;
    phaseOffset: number;
    orbitSpeed: number;
    color: string;
    blurRadius: number;
    layerDepth: 'foreground' | 'midground' | 'background' | 'cosmic-dust';
    pulseSpeed: number;
    opacityBase: number;
}

interface LightLeak {
    id: number;
    scaleX: number;
    scaleY: number;
    color: string;
    angleOffset: number;
    blur: number;
    positionStyle: React.CSSProperties;
}

export const MinimalistBokehLoop: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames, width, height } = useVideoConfig();

    // Progress linear konstan sirkular (0.0 sampai 1.0)
    const progress = frame / durationInFrames;
    // Sudut radian utama untuk mengunci sinkronisasi looping global (0 sampai 2*PI)
    const globalAngle = progress * 2 * Math.PI;

    /**
     * 1. GENERATOR DATA PARTIKEL BOKEH (STATIS via useMemo)
     * Menghasilkan total 190 partikel multi-layer teroptimasi.
     * Menggunakan persentase (0 - 100) untuk koordinat dasar agar posisi partikel
     * otomatis menyesuaikan diri secara proporsional dan memenuhi seluruh area layar.
     */
    const particles = useMemo<BokehParticle[]>(() => {
        const totalParticles = 190;
        const generated: BokehParticle[] = [];

        for (let i = 0; i < totalParticles; i++) {
            // Menggunakan persentase dengan sebaran berlebih (-10% sampai 110%) 
            // agar tepi luar layar tetap terisi partikel bokeh saat bergerak orbit
            const basePercentX = -10 + Math.random() * 120;
            const basePercentY = -10 + Math.random() * 120;

            const phaseOffset = Math.random() * Math.PI * 2;
            const orbitSpeed = 1 + (i % 3); // Harus integer agar kembali ke titik awal (seamless)
            const pulseSpeed = 1 + (i % 4); // Harus integer agar kedipan sinkron

            let size = 10;
            let radiusX = 20;
            let radiusY = 30;
            let layerDepth: BokehParticle['layerDepth'] = 'background';
            let opacityBase = 0.05;
            let isGold = Math.random() > 0.45;

            if (i < 30) {
                // LAYER 1: FOREGROUND (Sangat Besar, Sangat Buram, Sinematik di Depan Kamera)
                size = 200 + Math.random() * 130;
                radiusX = 70 + Math.random() * 60;
                radiusY = 90 + Math.random() * 80;
                layerDepth = 'foreground';
                opacityBase = 0.015 + Math.random() * 0.025;
            } else if (i < 95) {
                // LAYER 2: MIDGROUND (Ukuran Sedang, Fokus Menengah, Elemen Inti)
                size = 70 + Math.random() * 90;
                radiusX = 45 + Math.random() * 45;
                radiusY = 55 + Math.random() * 55;
                layerDepth = 'midground';
                opacityBase = 0.035 + Math.random() * 0.045;
            } else if (i < 155) {
                // LAYER 3: BACKGROUND (Kecil, Agak Tajam, Membentuk Dimensi Ruang)
                size = 30 + Math.random() * 35;
                radiusX = 20 + Math.random() * 20;
                radiusY = 25 + Math.random() * 30;
                layerDepth = 'background';
                opacityBase = 0.045 + Math.random() * 0.055;
            } else {
                // LAYER 4: COSMIC DUST (Sangat Kecil, Berkelap-kelip Tajam di Latar Paling Belakang)
                size = 3 + Math.random() * 5;
                radiusX = 8 + Math.random() * 12;
                radiusY = 8 + Math.random() * 12;
                layerDepth = 'cosmic-dust';
                opacityBase = 0.25 + Math.random() * 0.25;
            }

            // Ukuran blur disesuaikan dengan dimensi fisik bokeh
            const blurRadius = layerDepth === 'cosmic-dust' ? 0 : size * 0.24;

            // Pewarnaan Palet Luxury Premium
            let color = `rgba(255, 255, 255, ${opacityBase})`;
            if (isGold) {
                const goldType = i % 3;
                if (goldType === 0) {
                    color = `rgba(212, 175, 55, ${opacityBase})`;   // Luxury Gold
                } else if (goldType === 1) {
                    color = `rgba(244, 215, 122, ${opacityBase})`;  // Light Champagne
                } else {
                    color = `rgba(197, 160, 89, ${opacityBase})`;   // Matte Deep Gold
                }
            } else {
                color = `rgba(245, 247, 255, ${opacityBase})`;      // Platinum Soft White
            }

            generated.push({
                id: i,
                basePercentX,
                basePercentY,
                size,
                radiusX,
                radiusY,
                phaseOffset,
                orbitSpeed,
                color,
                blurRadius,
                layerDepth,
                pulseSpeed,
                opacityBase
            });
        }
        return generated;
    }, []);

    /**
     * 2. GENERATOR DATA LIGHT LEAKS (ANAMORPHIC FLARES)
     * Kebocoran cahaya besar yang ditempatkan di sudut-sudut kanvas secara absolut
     * untuk memberikan pencahayaan ambient studio yang dramatis.
     */
    const lightLeaks = useMemo<LightLeak[]>(() => {
        return [
            {
                id: 1,
                scaleX: 1.5,
                scaleY: 1.1,
                color: 'radial-gradient(circle at 0% 0%, rgba(212, 175, 55, 0.09) 0%, rgba(0,0,0,0) 70%)',
                angleOffset: 0,
                blur: 90,
                positionStyle: { top: 0, left: 0, width: '100%', height: '100%' }
            },
            {
                id: 2,
                scaleX: 1.3,
                scaleY: 1.4,
                color: 'radial-gradient(circle at 100% 100%, rgba(197, 160, 89, 0.07) 0%, rgba(0,0,0,0) 75%)',
                angleOffset: Math.PI / 4,
                blur: 110,
                positionStyle: { bottom: 0, right: 0, width: '100%', height: '100%' }
            },
            {
                id: 3,
                scaleX: 1.0,
                scaleY: 1.0,
                color: 'radial-gradient(ellipse at 50% 100%, rgba(255, 244, 224, 0.05) 0%, rgba(0,0,0,0) 65%)',
                angleOffset: Math.PI / 2,
                blur: 130,
                positionStyle: { bottom: 0, left: 0, width: '100%', height: '100%' }
            }
        ];
    }, []);

    return (
        <div
            style={{
                display: 'flex',
                flex: 1,
                backgroundColor: '#012a4a', // Biru laut yang menenangkan
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* LAYER VIGNETTE: Mengunci pencahayaan terpusat agar fokus tetap di tengah */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 50% 50%, rgba(18, 19, 26, 0.45) 0%, rgba(1, 42, 74, 1) 100%)',
                    zIndex: 1,
                    pointerEvents: 'none',
                }}
            />

            {/* LAYER LIGHT LEAKS: Pendaran cahaya sudut penuh */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                    pointerEvents: 'none',
                }}
            >
                {lightLeaks.map((leak) => {
                    // Gerakan ayunan sirkular mikro yang sinkron (looping sempurna)
                    const leakSwayX = Math.sin(globalAngle + leak.angleOffset) * 35;
                    const leakSwayY = Math.cos(globalAngle + leak.angleOffset) * 20;

                    return (
                        <div
                            key={leak.id}
                            style={{
                                position: 'absolute',
                                ...leak.positionStyle,
                                background: leak.color,
                                filter: `blur(${leak.blur}px)`,
                                mixBlendMode: 'screen',
                                transform: `translate3d(${leakSwayX}px, ${leakSwayY}px, 0) scale(${leak.scaleX}, ${leak.scaleY})`,
                            }}
                        />
                    );
                })}
            </div>

            {/* LAYER BOKEH ENGINE: Kontainer utama partikel melayang */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 3,
                    pointerEvents: 'none',
                }}
            >
                {particles.map((particle) => {
                    // Sudut lokal spesifik partikel berdasarkan kecepatan rotasinya
                    const localAngle = globalAngle * particle.orbitSpeed + particle.phaseOffset;

                    // Konversi koordinat persentase dasar menjadi satuan piksel dinamis real-time
                    const pixelBaseX = (particle.basePercentX / 100) * width;
                    const pixelBaseY = (particle.basePercentY / 100) * height;

                    // Lintasan orbit elips tertutup (Menjamin Seamless Loop)
                    const circularX = Math.cos(localAngle) * particle.radiusX;
                    const circularY = Math.sin(localAngle) * particle.radiusY;

                    // Noise turbulensi angin buatan (Dikunci sin/cos agar tetap menyatu di frame akhir)
                    const windNoiseX = Math.sin(globalAngle * 2 + particle.id) * 10;
                    const windNoiseY = Math.cos(globalAngle * 2 + particle.id) * 7;

                    // Akumulasi posisi akhir koordinat X dan Y
                    const finalX = pixelBaseX + circularX + windNoiseX;
                    const finalY = pixelBaseY + circularY + windNoiseY;

                    // Faktor kelap-kelip intensitas cahaya secara periodik sirkular
                    const pulseFactor = Math.sin(globalAngle * particle.pulseSpeed + particle.id);
                    const dynamicOpacity = interpolate(
                        pulseFactor,
                        [-1, 1],
                        [0.35, 1.0]
                    );

                    // Skala mikro dinamis khusus layer terdepan (Foreground)
                    const scaleFactor = particle.layerDepth === 'foreground'
                        ? interpolate(Math.cos(localAngle), [-1, 1], [0.92, 1.08])
                        : 1;

                    // Memaksa kompilasi gaya menggunakan akselerasi GPU penuh (Hardware Accelerated)
                    const particleInlineStyle: React.CSSProperties = {
                        position: 'absolute',
                        width: particle.size,
                        height: particle.size,
                        // Menggunakan translate3d untuk efisiensi render video 4K tanpa penurunan FPS
                        transform: `translate3d(${finalX - particle.size / 2}px, ${finalY - particle.size / 2}px, 0) scale(${scaleFactor})`,
                        backgroundColor: particle.color,
                        borderRadius: '50%',
                        mixBlendMode: 'screen',
                        opacity: dynamicOpacity,
                        filter: particle.blurRadius > 0 ? `blur(${particle.blurRadius}px)` : undefined,
                        willChange: 'transform, opacity',
                    };

                    return <div key={particle.id} style={particleInlineStyle} />;
                })}
            </div>

            {/* LAYER OVERLAY LETTERBOX: Penyeimbang gradasi tepian atas bawah layar */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '12%',
                    top: 0,
                    left: 0,
                    background: 'linear-gradient(to bottom, rgba(1, 42, 74, 0.85) 0%, rgba(0,0,0,0) 100%)',
                    zIndex: 4,
                    pointerEvents: 'none'
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '12%',
                    bottom: 0,
                    left: 0,
                    background: 'linear-gradient(to top, rgba(1, 42, 74, 0.85) 0%, rgba(0,0,0,0) 100%)',
                    zIndex: 4,
                    pointerEvents: 'none'
                }}
            />

            {/* CORES CENTRAL GLOW: Pendaran emas lembut konstan di pusat kanvas */}
            <div
                style={{
                    position: 'absolute',
                    width: '60%',
                    height: '60%',
                    left: '20%',
                    top: '20%',
                    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.025) 0%, rgba(0,0,0,0) 80%)',
                    filter: 'blur(100px)',
                    mixBlendMode: 'screen',
                    zIndex: 1,
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

/**
 * METADATA TEKNIS UNTUK OPTIMASI EKSPOR PREMIUM
 */
export const ProductionLogConfig = {
    buildTarget: 'Adobe Stock Loops High-VBR Component',
    canvasSizing: 'Responsive Auto-Fullstretch Percentage Layout',
    loopValidation: 'Trigonometric Orbital Reset (Perfect Seamless Loop)',
    architectureLinesCount: 335,
    keywords: [
        'luxury seamless background',
        'full screen bokeh loop',
        '4k cinematic particles',
        'gold elegant abstract'
    ]
};