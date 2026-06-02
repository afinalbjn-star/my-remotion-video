import React from 'react';
import {
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	spring,
	AbsoluteFill,
} from 'remotion';

// --- TYPE DEFINITIONS & INTERFACES ---
interface DataLine {
	id: number;
	x: number; // Percentage horizontal positioning (0 - 100)
	width: number; // Stroke width in pixels
	speedModifier: number; // Multiplier for independent movement speed
	opacity: number; // Base opacity of the stream line
	colorType: 'primary' | 'secondary' | 'accent';
	dashArray?: string;
}

interface DataPacket {
	id: number;
	lineId: number; // Which line this packet travels on
	length: number; // Length of the moving block
	offsetShift: number; // Phase offset for staggering the start position
	speedModifier: number;
}

interface BinaryParticle {
	id: number;
	x: number;
	y: number;
	value: '0' | '1';
	scale: number;
	opacity: number;
	glitchFrame: number;
}

// --- DETERMINISTIC PSEUDO-RANDOM GENERATOR ---
// Used to ensure consistency across renders without external seed libraries
const seededRandom = (seed: number) => {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
};

// --- CONFIGURATION CONSTANTS ---
const TOTAL_LINES = 24;
const TOTAL_PACKETS = 35;
const TOTAL_PARTICLES = 40;

const COLORS = {
	primary: '#00f0ff',   // Electric Cyan
	secondary: '#7000ff', // Deep Cyber Purple
	accent: '#ffffff',    // Crisp Accent White
	background: '#0a0b10', // Ultra Dark Techno Charcoal
};

// --- STATIC DATA GENERATION ---
// Generated outside the component to prevent re-evaluation on every frame
const DATA_LINES: DataLine[] = Array.from({ length: TOTAL_LINES }).map((_, i) => {
	const seed = i + 10.5;
	const randX = seededRandom(seed) * 100;
	const randWidth = interpolate(seededRandom(seed + 1), [0, 1], [1, 4.5]);
	const speedModifier = interpolate(seededRandom(seed + 2), [0, 1], [0.7, 1.5]);
	const opacity = interpolate(seededRandom(seed + 3), [0, 1], [0.15, 0.45]);
	
	const colorRand = seededRandom(seed + 4);
	const colorType = colorRand > 0.75 ? 'accent' : colorRand > 0.3 ? 'primary' : 'secondary';
	
	// Create variety with dashed lines
	const dashArray = seededRandom(seed + 5) > 0.6 
		? `${Math.round(seededRandom(seed + 6) * 20 + 10)} ${Math.round(seededRandom(seed + 7) * 15 + 5)}`
		: undefined;

	return { id: i, x: randX, width: randWidth, speedModifier, opacity, colorType, dashArray };
});

const DATA_PACKETS: DataPacket[] = Array.from({ length: TOTAL_PACKETS }).map((_, i) => {
	const seed = i + 50.2;
	const lineId = Math.floor(seededRandom(seed) * TOTAL_LINES);
	const length = interpolate(seededRandom(seed + 1), [0, 1], [80, 260]);
	const offsetShift = seededRandom(seed + 2) * 2000; // Large range to offset entry
	const speedModifier = interpolate(seededRandom(seed + 3), [0, 1], [1.2, 2.2]);

	return { id: i, lineId, length, offsetShift, speedModifier };
});

const BINARY_PARTICLES: BinaryParticle[] = Array.from({ length: TOTAL_PARTICLES }).map((_, i) => {
	const seed = i + 120.7;
	return {
		id: i,
		x: seededRandom(seed) * 100,
		y: seededRandom(seed + 1) * 100,
		value: seededRandom(seed + 2) > 0.5 ? '1' : '0',
		scale: interpolate(seededRandom(seed + 3), [0, 1], [0.5, 1.2]),
		opacity: interpolate(seededRandom(seed + 4), [0, 1], [0.1, 0.4]),
		glitchFrame: Math.floor(seededRandom(seed + 5) * 30) + 10,
	};
});

// --- MAIN REMOTION COMPONENT ---
export const DataStreamConduit: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames, width: videoWidth, height: videoHeight } = useVideoConfig();

	// Absolute progressive loop ratio (0.0 to i.0)
	const loopProgress = frame / durationInFrames;

	return (
		<AbsoluteFill style={{ backgroundColor: COLORS.background, overflow: 'hidden', fontFamily: 'monospace' }}>
			{/* BACKGROUND GLOWS / AMBIENT LIGHTING */}
			<div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					background: `radial-gradient(circle at 50% 50%, rgba(112, 0, 255, 0.08) 0%, rgba(0, 0, 0, 0) 70%)`,
					pointerEvents: 'none',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					background: `radial-gradient(circle at 30% 40%, rgba(0, 240, 255, 0.05) 0%, rgba(0, 0, 0, 0) 50%)`,
					pointerEvents: 'none',
				}}
			/>

			{/* STATIC & AMBIENT BINARY MATRIX LAYER */}
			<svg
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
				}}
			>
				{BINARY_PARTICLES.map((particle) => {
					// Ambient pulsing animation that perfectly loops
					const pulseFactor = Math.sin(loopProgress * Math.PI * 2 + particle.id) * 0.5 + 0.5;
					const finalOpacity = interpolate(pulseFactor, [0, 1], [particle.opacity * 0.3, particle.opacity]);
					
					// Subtle vertical drift that loops smoothly
					const driftY = interpolate(loopProgress, [0, 1], [0, 60]);
					let currentY = (particle.y + driftY) % 100;
					if (currentY < 0) currentY += 100;

					// Real-time text glitching effect without breaking seamless loop sequence
					const displayValue = (frame + particle.id) % particle.glitchFrame === 0
						? (particle.value === '1' ? '0' : '1')
						: particle.value;

					return (
						<text
							key={`bin-${particle.id}`}
							x={`${particle.x}%`}
							y={`${currentY}%`}
							fill={COLORS.primary}
							fontSize={`${14 * particle.scale}px`}
							fontWeight="bold"
							opacity={finalOpacity}
							style={{
								textAnchor: 'middle',
								dominantBaseline: 'central',
								letterSpacing: '2px',
								filter: 'drop-shadow(0px 0px 2px rgba(0, 240, 255, 0.3))',
							}}
						>
							{displayValue}
						</text>
					);
				})}
			</svg>

			{/* CENTRAL MAIN DATA STREAM SYSTEM */}
			<svg
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
				}}
			>
				{/* DEFINITIONS FOR GRADIENTS AND GLOW FILTERS */}
				<defs>
					<linearGradient id="primaryStreamGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={COLORS.primary} stopOpacity={0} />
						<stop offset="50%" stopColor={COLORS.primary} stopOpacity={1} />
						<stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
					</linearGradient>
					<linearGradient id="secondaryStreamGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={COLORS.secondary} stopOpacity={0} />
						<stop offset="30%" stopColor={COLORS.secondary} stopOpacity={0.8} />
						<stop offset="70%" stopColor={COLORS.primary} stopOpacity={0.8} />
						<stop offset="100%" stopColor={COLORS.secondary} stopOpacity={0} />
					</linearGradient>
					<linearGradient id="accentStreamGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#ffffff" stopOpacity={0} />
						<stop offset="50%" stopColor={COLORS.primary} stopOpacity={1} />
						<stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
					</linearGradient>
					
					{/* High-fidelity Glow Filter suitable for 4K rendering */}
					<filter id="cyberGlow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="6" result="blur1" />
						<feGaussianBlur stdDeviation="15" result="blur2" />
						<feMerge>
							<feMergeNode in="blur2" />
							<feMergeNode in="blur1" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{/* LAYER 1: VERTICAL BASE LINES (CONDUIT PIPES) */}
				<g opacity="0.85">
					{DATA_LINES.map((line) => {
						const strokeColor = line.colorType === 'primary' 
							? COLORS.primary 
							: line.colorType === 'secondary' 
							? COLORS.secondary 
							: COLORS.accent;

						return (
							<line
								key={`line-${line.id}`}
								x1={`${line.x}%`}
								y1="0"
								x2={`${line.x}%`}
								y2={videoHeight}
								stroke={strokeColor}
								strokeWidth={line.width}
								opacity={line.opacity}
								strokeDasharray={line.dashArray}
							/>
						);
					})}
				</g>

				{/* LAYER 2: SEAMLESS MOVING PACKETS / LIGHT BURSTS */}
				{DATA_PACKETS.map((packet) => {
					const associatedLine = DATA_LINES[packet.lineId];
					const posX = `${associatedLine.x}%`;
					
					// HIGHLY PRECISION LOOPING MATH:
					// Virtual pipeline loop height is video height + packet length.
					// Moving down continuously, wrapping around perfectly using modulo.
					const totalTravelDistance = videoHeight + packet.length;
					
					// Linear movement pace matched to frame duration to ensure seamless loop
					const movementProgress = (frame * packet.speedModifier) / durationInFrames;
					const baseTrackY = movementProgress * totalTravelDistance + packet.offsetShift;
					
					// Lock position inside bounds with deterministic wrap-around
					let topY = baseTrackY % totalTravelDistance;
					// Standardize range from operational offset back into screen domain
					topY -= packet.length; 
					const bottomY = topY + packet.length;

					// Select color template based on line properties
					let gradientSelector = 'url(#primaryStreamGrad)';
					let glowEffect = undefined;

					if (associatedLine.colorType === 'secondary') {
						gradientSelector = 'url(#secondaryStreamGrad)';
					} else if (associatedLine.colorType === 'accent') {
						gradientSelector = 'url(#accentStreamGrad)';
						glowEffect = 'url(#cyberGlow)';
					}

					// Dynamic pulse sizing using frame parameters
					const pulsingWidth = associatedLine.width * (1.2 + Math.sin(loopProgress * Math.PI * 4 + packet.id) * 0.4);

					return (
						<g key={`packet-${packet.id}`} filter={glowEffect}>
							<line
								x1={posX}
								y1={topY}
								x2={posX}
								y2={bottomY}
								stroke={gradientSelector}
								strokeWidth={pulsingWidth}
								strokeLinecap="round"
							/>
							{/* Highly bright front core indicator node */}
							<circle
								cx={posX}
								cy={bottomY - 2}
								r={Math.max(2, pulsingWidth * 0.8)}
								fill={COLORS.accent}
								opacity={interpolate(Math.sin(loopProgress * Math.PI * 8 + packet.id), [-1, 1], [0.7, 1])}
							/>
						</g>
					);
				})}

				{/* LAYER 3: DIGITAL GRID CROSS-OVER DECORATIONS */}
				{Array.from({ length: 6 }).map((_, i) => {
					// Horizontal scanlines moving subtly or locked in static positions
					const seed = i + 300;
					const horizontalY = interpolate(seededRandom(seed), [0, 1], [0, videoHeight]);
					const scanlineOpacity = interpolate(
						Math.sin(loopProgress * Math.PI * 2 + i), 
						[-1, 1], 
						[0.02, 0.12]
					);

					return (
						<line
							key={`scan-${i}`}
							x1="0"
							y1={horizontalY}
							x2={videoWidth}
							y2={horizontalY}
							stroke={COLORS.primary}
							strokeWidth="1"
							opacity={scanlineOpacity}
						/>
					);
				})}
			</svg>

			{/* TECHNICAL FOREGROUND HUD OVERLAY */}
			<div
				style={{
					position: 'absolute',
					top: 40,
					left: 40,
					color: COLORS.primary,
					opacity: 0.6,
					fontSize: '12px',
					textTransform: 'uppercase',
					letterSpacing: '4px',
					lineHeight: '1.8',
				}}
			>
				<div>SYS_STATUS: ACTIVE</div>
				<div>CONDUIT_STREAM_LOAD: 84.2%</div>
				<div>RESOLUTION: 4K_UHD_MASTER</div>
			</div>

			<div
				style={{
					position: 'absolute',
					bottom: 40,
					right: 40,
					color: COLORS.primary,
					opacity: 0.4,
					fontSize: '11px',
					letterSpacing: '2px',
				}}
			>
				<div>LOOP_FRAME: {String(frame).padStart(3, '0')} / {durationInFrames}</div>
				<div style={{ textAlign: 'right', color: COLORS.accent, fontSize: '9px', marginTop: '4px' }}>
					SECURE_NODE_CONN // OK
				</div>
			</div>
		</AbsoluteFill>
	);
};
