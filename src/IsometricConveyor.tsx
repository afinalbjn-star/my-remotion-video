import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";

const PATTERN_SIZE = 800; // Pola lebih besar untuk variasi yang lebih kaya

export const IsometricConveyor: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const progress = frame / durationInFrames;
    const mainShift = interpolate(progress, [0, 1], [0, PATTERN_SIZE]);

    // Efek kedip warna (Color Pulsing)
    const pulse = Math.sin(progress * Math.PI * 10) * 0.5 + 0.5;

    return (
        <AbsoluteFill style={{ backgroundColor: "#02040a", overflow: "hidden" }}>
            {/* 1. BACKGROUND GRADIENT DYNAMIC */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background: `radial-gradient(circle at 50% 50%, #1a0b2e 0%, #02040a 70%)`,
                }}
            />

            {/* 2. ISOMETRIC WORLD */}
            <div
                style={{
                    width: "300%",
                    height: "300%",
                    position: "absolute",
                    top: "-100%",
                    left: "-100%",
                    transform: "rotateX(55deg) rotateZ(-25deg)",
                    transformStyle: "preserve-3d",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {/* GRID LANTAI BERWARNA (Cyber Grid) */}
                <div
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        backgroundImage: `
              linear-gradient(to right, rgba(255, 0, 255, 0.1) 2px, transparent 2px),
              linear-gradient(to bottom, rgba(0, 255, 255, 0.1) 2px, transparent 2px)
            `,
                        backgroundSize: "100px 100px",
                    }}
                />

                {/* JALUR KONVEYOR UTAMA (Glass Texture) */}
                <div
                    style={{
                        position: "absolute",
                        width: "1400px",
                        height: "100%",
                        background: "linear-gradient(90deg, rgba(255,0,255,0.05), rgba(0,255,255,0.05))",
                        borderLeft: "8px solid #ff00ff",
                        borderRight: "8px solid #00ffff",
                        boxShadow: "0 0 100px rgba(255,0,255,0.2), inset 0 0 50px rgba(0,255,255,0.1)",
                    }}
                >
                    {/* Garis-garis energi yang mengalir */}
                    <div
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backgroundImage: `linear-gradient(to bottom, transparent, rgba(255, 215, 0, 0.3) 50%, transparent)`,
                            backgroundSize: `100% ${PATTERN_SIZE}px`,
                            backgroundPosition: `0px ${mainShift}px`,
                        }}
                    />
                </div>

                {/* ELEMEN BERGERAK (The Machines) */}
                <div
                    style={{
                        position: "absolute",
                        width: "1400px",
                        height: "100%",
                        transform: `translateY(${mainShift}px)`,
                    }}
                >
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                top: `${(i - 1) * PATTERN_SIZE}px`,
                                width: "100%",
                                height: `${PATTERN_SIZE}px`,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-around",
                                alignItems: "center",
                            }}
                        >
                            {/* UNIT 1: CYBER CORE (Magenta & Gold) */}
                            <div style={{ display: "flex", gap: "60px", alignItems: "center" }}>
                                <div style={{
                                    width: "200px",
                                    height: "200px",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    backdropFilter: "blur(20px)",
                                    borderRadius: "40px",
                                    border: "4px solid #ff00ff",
                                    boxShadow: `0 0 ${20 + pulse * 40}px #ff00ff`,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    transform: `rotateZ(${frame}deg)`,
                                }}>
                                    <div style={{ width: "100px", height: "100px", background: "#ffd700", borderRadius: "20px", boxShadow: "0 0 30px #ffd700" }} />
                                </div>

                                {/* Kabel Energi yang menyala */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {[...Array(3)].map((_, k) => (
                                        <div key={k} style={{
                                            width: "300px",
                                            height: "10px",
                                            background: k === 1 ? "#00ffff" : "#ff00ff",
                                            borderRadius: "5px",
                                            boxShadow: `0 0 20px ${k === 1 ? "#00ffff" : "#ff00ff"}`,
                                            opacity: pulse
                                        }} />
                                    ))}
                                </div>
                            </div>

                            {/* UNIT 2: DATA POD (Cyan & Purple) */}
                            <div style={{
                                width: "90%",
                                height: "150px",
                                background: "linear-gradient(45deg, rgba(123, 31, 162, 0.4), rgba(0, 188, 212, 0.4))",
                                borderRadius: "30px",
                                border: "2px solid rgba(255,255,255,0.3)",
                                backdropFilter: "blur(10px)",
                                display: "flex",
                                alignItems: "center",
                                padding: "0 60px",
                                justifyContent: "space-between"
                            }}>
                                <div style={{ width: "80px", height: "80px", backgroundColor: "#ff00ff", borderRadius: "50%", boxShadow: "0 0 40px #ff00ff" }} />
                                <div style={{ flex: 1, height: "20px", background: "rgba(0,0,0,0.5)", margin: "0 40px", borderRadius: "10px", overflow: 'hidden' }}>
                                    <div style={{
                                        width: "40%",
                                        height: "100%",
                                        background: "#00ffff",
                                        boxShadow: "0 0 20px #00ffff",
                                        transform: `translateX(${(frame * 10) % 600}px)`
                                    }} />
                                </div>
                                <div style={{ width: "120px", height: "60px", border: "4px solid #ffd700", borderRadius: "10px" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. FLOATING PARTICLES (Dust/Sparks) */}
            {[...Array(30)].map((_, i) => {
                const x = (i * 137) % 100;
                const y = (i * 153 + frame * 2) % 100;
                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: `${x}%`,
                            top: `${y}%`,
                            width: "6px",
                            height: "6px",
                            backgroundColor: i % 2 === 0 ? "#00ffff" : "#ff00ff",
                            borderRadius: "50%",
                            boxShadow: `0 0 15px ${i % 2 === 0 ? "#00ffff" : "#ff00ff"}`,
                            opacity: 0.6,
                        }}
                    />
                );
            })}

            {/* 4. OVERLAY GLOWS (Efek dramatis di pojok layar) */}
            <div style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                background: `
          radial-gradient(circle at 0% 0%, rgba(255, 0, 255, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 100% 100%, rgba(0, 255, 255, 0.15) 0%, transparent 40%)
        `,
                pointerEvents: "none"
            }} />

            {/* VIGNETTE */}
            <div style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                boxShadow: "inset 0 0 300px rgba(0,0,0,0.8)",
                pointerEvents: "none"
            }} />
        </AbsoluteFill>
    );
};