import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    Easing,
    random,
} from 'remotion';

// Palet Warna (Cerah & Bersemangat)
const QUANTUM_COLORS = {
    electricBlue: '#00F2FF',
    quantumPurple: '#9D00FF',
    neonGreen: '#39FF14',
    laserPink: '#FF007F',
    laserOrange: '#FF9E00',   // Warna Baru
    neonYellow: '#FBFF00',    // Warna Baru
    deepSpaceBlack: '#010206', // Hitam Angkasa Dalam (Background)
};

export const QuantumFlux: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Progress loop setiap 10 detik (600 frame pada 60fps)
    const loopFrames = 600;
    const progress = (frame % loopFrames) / loopFrames; // 0 to 1

    // Scale factor for responsive sizing (maintaining aspect ratio for 4K)
    const scaleFactor = Math.min(width / 3840, height / 2160);

    // --- Ethereal Orbs (Background, blurred) ---
    const numOrbs = 25; // Ditambah agar lebih ramai
    const orbs = Array.from({ length: numOrbs }).map((_, i) => {
        const seed = `orb-${i}`;
        const offset = random(seed) * 0.5; // Stagger appearance
        const p = (progress + offset) % 1;

        // Orb size and blur animate in and out
        const size = interpolate(p, [0, 0.5, 1], [0.5, 1.2, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * (300 + random(`${seed}-size`) * 400) * scaleFactor;
        const blur = interpolate(p, [0, 0.5, 1], [0.8, 1, 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * (40 + random(`${seed}-blur`) * 60);
        const opacity = interpolate(p, [0, 0.2, 0.8, 1], [0, 0.25, 0.25, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        // Orbs drift across the screen
        const x = interpolate(p, [0, 1], [random(`${seed}-x-start`) * width, random(`${seed}-x-end`) * width]);
        const y = interpolate(p, [0, 1], [random(`${seed}-y-start`) * height, random(`${seed}-y-end`) * height]);

        const colorPool = Object.values(QUANTUM_COLORS).filter(c => c !== QUANTUM_COLORS.deepSpaceBlack);
        const color = colorPool[Math.floor(random(`${seed}-color`) * colorPool.length)];

        return { id: i, x, y, size, blur, opacity, color };
    });

    // --- Sparkles (Glinting professional effects) ---
    const numSparkles = 50;
    const sparkles = Array.from({ length: numSparkles }).map((_, i) => {
        const seed = `sparkle-${i}`;
        const x = random(`${seed}-x`) * width;
        const y = random(`${seed}-y`) * height;
        const size = (2 + random(`${seed}-size`) * 4) * scaleFactor;
        const phase = random(`${seed}-phase`) * Math.PI * 2;

        // Twinkle logic
        const twinkle = Math.sin(frame * 0.15 + phase) * 0.5 + 0.5;
        const color = i % 2 === 0 ? QUANTUM_COLORS.electricBlue : QUANTUM_COLORS.neonYellow;

        return { id: i, x, y, size, opacity: twinkle, color };
    });

    // --- Core Flux (Main flowing elements, less blurred but gooey effect) ---
    const numFluxElements = 12; // Lebih banyak elemen warna
    const fluxElements = Array.from({ length: numFluxElements }).map((_, i) => {
        const seed = `flux-${i}`;
        const offset = i / numFluxElements;
        const p = (progress + offset) % 1;

        // Rotation speed and direction
        const rotationSpeed = (random(`${seed}-rot-speed`) * 360 + 180) * (i % 2 === 0 ? 1 : -1);
        const rotation = interpolate(p, [0, 1], [0, rotationSpeed], { easing: Easing.linear });

        // Scale and translate for flowing motion
        const scale = interpolate(p, [0, 0.5, 1], [0.5, 1.5, 0.5], { easing: Easing.bezier(0.4, 0, 0.6, 1) });
        const translateX = interpolate(p, [0, 1], [-width * 0.3, width * 0.3], { easing: Easing.easeInOutQuad });
        const translateY = interpolate(p, [0, 1], [-height * 0.2, height * 0.2], { easing: Easing.easeInOutQuad });

        const colorPool = [
            QUANTUM_COLORS.electricBlue,
            QUANTUM_COLORS.quantumPurple,
            QUANTUM_COLORS.neonGreen,
            QUANTUM_COLORS.laserPink,
            QUANTUM_COLORS.laserOrange,
            QUANTUM_COLORS.neonYellow
        ];
        const color = colorPool[i % colorPool.length];

        // Wobble for organic, fluid shape changes
        const wobble = Math.sin(frame * 0.1 + i * 0.5) * (20 * scaleFactor);
        const borderRadius = `${40 + wobble}% ${60 - wobble}% ${50 + wobble}% ${50 - wobble}% / ${55 - wobble}% ${45 + wobble}% ${65 - wobble}% ${35 - wobble}%`;

        return { id: i, rotation, scale, translateX, translateY, color, borderRadius };
    });

    // --- Data Tendrils (Fast-moving, sharp with subtle motion blur) ---
    const numTendrils = 20;
    const tendrils = Array.from({ length: numTendrils }).map((_, i) => {
        const seed = `tendril-${i}`;
        const offset = random(seed) * 0.7;
        const p = (progress + offset) % 1;

        // Tendrils dart from random start to end points
        const startX = random(`${seed}-sx`) * width;
        const startY = random(`${seed}-sy`) * height;
        const endX = random(`${seed}-ex`) * width;
        const endY = random(`${seed}-ey`) * height;

        const x = interpolate(p, [0, 1], [startX, endX], { easing: Easing.easeOutCubic });
        const y = interpolate(p, [0, 1], [startY, endY], { easing: Easing.easeOutCubic });
        const opacity = interpolate(p, [0, 0.1, 0.9, 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const length = interpolate(p, [0, 0.5, 1], [0, 100 * scaleFactor, 0], { easing: Easing.easeOutSine });

        const rotation = random(`${seed}-rot`) * 360;
        const color = QUANTUM_COLORS.neonGreen;

        return { id: i, x, y, opacity, length, rotation, color };
    });

    // --- Subtle Glitch/Energy Pulses (Laser Pink) ---
    // This effect is very short and infrequent, creating a subtle disturbance.
    const glitchFrequency = 0.5; // Adjust for more or less frequent glitches
    const glitchIntensity = interpolate(Math.sin(frame * glitchFrequency), [-1, 1], [0, 0.1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const glitchScale = interpolate(Math.sin(frame * glitchFrequency), [-1, 1], [1, 1.05], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ backgroundColor: QUANTUM_COLORS.deepSpaceBlack, overflow: 'hidden' }}>
            {/* Ethereal Orbs (Blurred Background Elements) */}
            {orbs.map((orb) => (
                <div
                    key={orb.id}
                    style={{
                        position: 'absolute',
                        left: orb.x,
                        top: orb.y,
                        width: orb.size,
                        height: orb.size,
                        borderRadius: '50%',
                        backgroundColor: orb.color,
                        opacity: orb.opacity,
                        filter: `blur(${orb.blur}px)`, // Depth of field blur
                        transform: `translate(-50%, -50%)`,
                        boxShadow: `0 0 ${orb.size / 4}px ${orb.color}`, // Soft glow
                    }}
                />
            ))}

            {/* Core Flux (Main Flowing Elements) - Using a gooey container for merging effect */}
            {/* The blur and contrast filter on this container makes the elements inside merge and flow like liquid. */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    filter: `blur(${15 * scaleFactor}px) contrast(15) brightness(1.2)`, // Gooey filter for merging blobs
                    // No background color here, allowing the main AbsoluteFill to provide the deep space black
                }}
            >
                {fluxElements.map((flux) => (
                    <div
                        key={flux.id}
                        style={{
                            position: 'absolute',
                            width: width * 0.6 * scaleFactor,
                            height: height * 0.4 * scaleFactor,
                            backgroundColor: flux.color,
                            borderRadius: flux.borderRadius,
                            transform: `translate(${flux.translateX}px, ${flux.translateY}px) rotate(${flux.rotation}deg) scale(${flux.scale})`,
                            boxShadow: `0 0 ${50 * scaleFactor}px ${flux.color}`, // Glowing effect
                            opacity: 0.8, // Maintain visibility
                        }}
                    />
                ))}
            </div>

            {/* Data Tendrils (Sharp, fast-moving elements) */}
            {tendrils.map((tendril) => (
                <div
                    key={tendril.id}
                    style={{
                        position: 'absolute',
                        left: tendril.x,
                        top: tendril.y,
                        width: tendril.length,
                        height: 3 * scaleFactor,
                        backgroundColor: tendril.color,
                        opacity: tendril.opacity,
                        transform: `translate(-50%, -50%) rotate(${tendril.rotation}deg)`,
                        boxShadow: `0 0 ${10 * scaleFactor}px ${tendril.color}`, // Subtle glow
                        filter: `blur(${tendril.length > 50 * scaleFactor ? 2 : 0}px)`, // Conditional motion blur for longer tendrils
                    }}
                />
            ))}

            {/* Subtle Glitch/Energy Pulses Overlay */}
            <AbsoluteFill
                style={{
                    backgroundColor: QUANTUM_COLORS.laserPink,
                    opacity: glitchIntensity,
                    transform: `scale(${glitchScale})`,
                    filter: `blur(${10 * scaleFactor}px)`, // Blurred to make it subtle
                    pointerEvents: 'none', // Ensure it doesn't interfere with interactions
                }}
            />

            {/* Sparkles (Twinkling Glints) */}
            {sparkles.map((sparkle) => (
                <div
                    key={sparkle.id}
                    style={{
                        position: 'absolute',
                        left: sparkle.x,
                        top: sparkle.y,
                        width: sparkle.size,
                        height: sparkle.size,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        opacity: sparkle.opacity,
                        boxShadow: `0 0 ${sparkle.size * 3}px ${sparkle.color}, 0 0 ${sparkle.size * 6}px white`,
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            ))}
        </AbsoluteFill>
    );
};