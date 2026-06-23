import React, { useEffect, useMemo, useRef } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

// ==========================================
// 1. UTILITAS MATEMATIKA & PRNG (DETERMINISTIK)
// ==========================================

// Pseudo-random generator (Mulberry32) - Wajib untuk Remotion agar render konsisten
function seededPRNG(a: number) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ==========================================
// 2. KELAS VEKTOR 3D
// ==========================================
class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // Rotasi sumbu X (Pitch)
    rotateX(angle: number) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const ny = this.y * cos - this.z * sin;
        const nz = this.y * sin + this.z * cos;
        this.y = ny;
        this.z = nz;
    }

    // Rotasi sumbu Y (Yaw)
    rotateY(angle: number) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const nx = this.x * cos + this.z * sin;
        const nz = -this.x * sin + this.z * cos;
        this.x = nx;
        this.z = nz;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
}

// ==========================================
// 3. KONFIGURASI ENGINE
// ==========================================
const CONFIG = {
    particles: {
        gridColumns: 90,
        gridRows: 90,
        spacing: 50,
        ambientCount: 500, // Partikel melayang bebas (Bokeh foreground)
    },
    camera: {
        focalLength: 1200,
        focusDistance: 2500, // Titik fokus ketajaman (Z)
        blurMultiplier: 0.005, // Intensitas Bokeh
        yOffset: -600, // Ketinggian kamera
        zOffset: 1500, // Jarak kamera
        pitch: 0.25, // Kemiringan kamera menunduk (Radians)
        yawAmplitude: 0.15, // Gerakan geleng kamera (Seamless loop)
    },
    wave: {
        baseAmplitude: 350,
        // 4 Lapisan gelombang untuk pergerakan organik (Fourier Harmonics)
        harmonics: [
            { freqX: 0.015, freqZ: 0.02, speed: 1, amp: 1.0 },
            { freqX: 0.03, freqZ: 0.01, speed: -1, amp: 0.5 },
            { freqX: 0.05, freqZ: 0.04, speed: 2, amp: 0.25 },
            { freqX: 0.005, freqZ: 0.008, speed: 1, amp: 1.5 },
        ],
    },
    colors: {
        background: '#010610',
        core: [120, 200, 255], // RGB
        glow: [40, 100, 220], // RGB
    },
};

// ==========================================
// 4. KELAS PARTIKEL
// ==========================================
type ParticleType = 'GRID' | 'AMBIENT';

class Particle {
    basePos: Vector3; // Posisi absolut asli
    currentPos: Vector3; // Posisi setelah rotasi & gelombang
    screenX: number = 0;
    screenY: number = 0;
    scale: number = 0;
    alpha: number = 1;
    blur: number = 0;
    depth: number = 0; // Untuk Z-Sorting
    size: number;
    type: ParticleType;
    randomPhase: number;

    constructor(x: number, y: number, z: number, type: ParticleType, rand: () => number) {
        this.basePos = new Vector3(x, y, z);
        this.currentPos = new Vector3(x, y, z);
        this.type = type;
        this.size = type === 'GRID' ? (rand() * 2 + 1.5) : (rand() * 8 + 4);
        this.randomPhase = rand() * Math.PI * 2;
    }

    update(time: number, cameraYaw: number) {
        // A. Reset current pos ke base pos
        this.currentPos.x = this.basePos.x;
        this.currentPos.y = this.basePos.y;
        this.currentPos.z = this.basePos.z;

        // B. Aplikasikan Logika Gelombang (Khusus partikel Grid)
        if (this.type === 'GRID') {
            let waveHeight = 0;
            // Menjumlahkan 4 lapis gelombang sinus agar terlihat seperti air sungguhan
            for (const h of CONFIG.wave.harmonics) {
                waveHeight +=
                    Math.sin(this.basePos.x * h.freqX + this.basePos.z * h.freqZ + time * h.speed) *
                    CONFIG.wave.baseAmplitude *
                    h.amp;
            }
            this.currentPos.y += waveHeight;
        } else {
            // Pergerakan melayang santai untuk partikel Ambient (Foreground Bokeh)
            this.currentPos.x += Math.sin(time + this.randomPhase) * 400;
            this.currentPos.y += Math.cos(time + this.randomPhase) * 200;
            this.currentPos.z += Math.sin(time * 2 + this.randomPhase) * 600;
        }

        // C. Transformasi Ruang Kamera (Translasi & Rotasi)
        this.currentPos.x -= 0; // Kamera di tengah X
        this.currentPos.y -= CONFIG.camera.yOffset;
        this.currentPos.z -= CONFIG.camera.zOffset;

        // Rotasi Yaw (Geleng Kanan-Kiri yang looping)
        this.currentPos.rotateY(cameraYaw);

        // Rotasi Pitch (Menunduk ke arah gelombang)
        this.currentPos.rotateX(CONFIG.camera.pitch);

        // Kedalaman untuk Z-Sorting
        this.depth = this.currentPos.z;
    }

    project(width: number, height: number) {
        // Proyeksi Perspektif
        const fl = CONFIG.camera.focalLength;
        const z = this.currentPos.z;

        // Cegah rendering partikel yang berada di belakang lensa kamera
        if (z < -fl + 100) {
            this.scale = -1; // Flag untuk tidak di-render
            return;
        }

        this.scale = fl / (fl + z);
        this.screenX = width / 2 + this.currentPos.x * this.scale;
        this.screenY = height / 2 + this.currentPos.y * this.scale;

        // Kalkulasi Depth of Field (DoF)
        const distanceToFocus = Math.abs(z - CONFIG.camera.focusDistance);
        this.blur = distanceToFocus * CONFIG.camera.blurMultiplier * this.scale;

        // Pengaturan Alpha: Semakin jauh atau semakin dekat, semakin pudar
        let distanceAlpha = 1;
        if (z > 6000) {
            distanceAlpha = Math.max(0, 1 - (z - 6000) / 4000); // Fading di horizon
        } else if (z < 1000) {
            distanceAlpha = Math.max(0, z / 1000); // Fading menembus kamera
        }
        this.alpha = distanceAlpha;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.scale <= 0 || this.alpha <= 0.05) return;

        const finalSize = Math.max(0.1, this.size * this.scale);

        // Terapkan efek filter (Blur) jika partikel sangat tidak fokus (Bokeh)
        if (this.blur > 1) {
            ctx.filter = `blur(${this.blur}px)`;
            // Partikel blur biasanya terlihat lebih redup transparasinya
            ctx.globalAlpha = this.alpha * 0.6;
        } else {
            ctx.filter = 'none';
            ctx.globalAlpha = this.alpha;
        }

        const [r, g, b] = CONFIG.colors.core;

        ctx.beginPath();
        ctx.arc(this.screenX, this.screenY, finalSize, 0, Math.PI * 2);

        // Partikel tajam (berada di fokus) diberi pendaran (glow)
        if (this.blur <= 1 && this.type === 'GRID') {
            ctx.shadowBlur = 20 * this.scale;
            ctx.shadowColor = `rgb(${CONFIG.colors.glow.join(',')})`;
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fill();

        // Reset shadow untuk performa
        ctx.shadowBlur = 0;
    }
}

// ==========================================
// 5. KOMPONEN REACT / REMOTION UTAMA
// ==========================================
export const CinematicWave: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Inisialisasi Sistem Partikel (Dijalankan hanya sekali)
    const particles = useMemo(() => {
        const items: Particle[] = [];
        const rand = seededPRNG(12345); // Seed statis untuk konsistensi Remotion

        // 1. Generate Lapisan Gelombang (Grid)
        const cols = CONFIG.particles.gridColumns;
        const rows = CONFIG.particles.gridRows;
        const spacing = CONFIG.particles.spacing;

        const startX = -((cols * spacing) / 2);
        const startZ = 0; // Mulai dari pusat hingga ke dalam layar

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = startX + i * spacing;
                const z = startZ + j * spacing;
                const y = 0;

                // Membengkokkan tepi grid ke bawah agar terlihat seperti lautan tak bertepi
                const distanceToEdgeX = Math.min(i, cols - i) / cols;
                const edgeFalloff = Math.pow(1 - distanceToEdgeX, 3) * 1500;

                items.push(new Particle(x, y + edgeFalloff, z, 'GRID', rand));
            }
        }

        // 2. Generate Lapisan Ambient (Bokeh di depan dan belakang layar)
        for (let k = 0; k < CONFIG.particles.ambientCount; k++) {
            const x = (rand() - 0.5) * 8000;
            const y = (rand() - 0.5) * 4000;
            const z = rand() * 10000; // Tersebar di seluruh kedalaman
            items.push(new Particle(x, y, z, 'AMBIENT', rand));
        }

        return items;
    }, []);

    // Render Loop Utama
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Kalkulasi Waktu Seamless Loop
        // frame 0 = time 0, frame (durationInFrames-1) = time 2p, loop: sin(2p)=sin(0)
        const progress = frame / (durationInFrames - 1);
        const time = progress * Math.PI * 2;

        // Gerakan kamera mulus yang juga looping sempurna
        const cameraYaw = Math.sin(time) * CONFIG.camera.yawAmplitude;

        // 1. Bersihkan frame & Gambar Background Hitam Kebiruan
        ctx.fillStyle = CONFIG.colors.background;
        ctx.fillRect(0, 0, width, height);

        // Tambahkan cahaya pendaran besar di pusat horizon
        const bgGradient = ctx.createRadialGradient(
            width / 2, height / 2 - 200, 0,
            width / 2, height / 2 - 200, width * 0.8
        );
        bgGradient.addColorStop(0, 'rgba(10, 45, 90, 0.5)'); // Pusat biru bercahaya
        bgGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // 2. Update Fisika & Proyeksi semua partikel
        particles.forEach(p => {
            p.update(time, cameraYaw);
            p.project(width, height);
        });

        // 3. Z-Sorting Algoritma (Penting untuk 3D)
        // Urutkan array partikel dari Z terbesar (paling jauh) ke Z terkecil (paling dekat)
        // agar partikel yang dekat menimpa (overlap) partikel yang jauh secara visual
        const sortedParticles = [...particles].sort((a, b) => b.depth - a.depth);

        // 4. Render seluruh partikel ke Canvas
        ctx.globalCompositeOperation = 'screen'; // Blending cahaya agar terlihat bersinar ketika bertumpuk

        sortedParticles.forEach(p => {
            p.draw(ctx);
        });

        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        // 5. Post-Processing: Vignette Effect (Penggelapan di sudut layar)
        const vignette = ctx.createRadialGradient(
            width / 2, height / 2, width * 0.3,
            width / 2, height / 2, width * 0.7
        );
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.8)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

    }, [frame, width, height, durationInFrames, particles]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
                backgroundColor: '#000'
            }}
        />
    );
};