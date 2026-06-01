import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
	spring,
	random
} from 'remotion';
import React, { useMemo } from 'react';

// --- CONFIGURATION CONSTANTS ---
const NODE_COUNT = 45;
const CONNECTION_DISTANCE = 650; // Ditingkatkan agar garis muncul di resolusi 4K
const CANVAS_WIDTH = 3840;
const CANVAS_HEIGHT = 2160;

// Helper function to generate stable pseudo-random properties based on an index
const getSeedRandom = (seed: number) => {
	let s = Math.sin(seed) * 10000;
	return s - Math.floor(s);
};

// Interface definitions
interface NodeItem {
	id: number;
	baseX: number;
	baseY: number;
	radiusX: number;
	radiusY: number;
	speedX: number;
	speedY: number;
	phaseX: number;
	phaseY: number;
	size: number;
	pulseSpeed: number;
	colorType: number;
}

interface ConnectionItem {
	from: NodeItem;
	to: NodeItem;
}

export const AbstractCorporateNetwork: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	// --- 1. GENERATE STABLE NODE DATA ---
	// Using useMemo with empty dependency array so the background elements
	// maintain identity and positions across frames without re-rolling.
	const nodes: NodeItem[] = useMemo(() => {
		const generatedNodes: NodeItem[] = [];
		for (let i = 0; i < NODE_COUNT; i++) {
			// Distribute nodes evenly but with random padding to prevent heavy clumping
			const col = i % 9;
			const row = Math.floor(i / 9);

			const segmentWidth = CANVAS_WIDTH / 9;
			const segmentHeight = CANVAS_HEIGHT / 5;

			const r1 = getSeedRandom(i * 12 + 5.4);
			const r2 = getSeedRandom(i * 27 + 3.1);
			const r3 = getSeedRandom(i * 45 + 9.8);
			const r4 = getSeedRandom(i * 72 + 1.2);
			const r5 = getSeedRandom(i * 89 + 7.6);
			const r6 = getSeedRandom(i * 103 + 2.4);

			// Base center coordinates for this node's orbit
			const baseX = (col * segmentWidth) + (segmentWidth / 2) + (r1 * 150 - 75);
			const baseY = (row * segmentHeight) + (segmentHeight / 2) + (r2 * 150 - 75);

			generatedNodes.push({
				id: i,
				baseX,
				baseY,
				// Orbit radius
				radiusX: 60 + r3 * 100,
				radiusY: 40 + r4 * 80,
				// Speed scale multiplier
				speedX: 1.0 + r5 * 0.8,
				speedY: 0.8 + r6 * 1.0,
				// Initial phase angles
				phaseX: r1 * Math.PI * 2,
				phaseY: r2 * Math.PI * 2,
				// Node size
				size: 4 + Math.floor(r3 * 10),
				pulseSpeed: 1.5 + r4 * 2,
				colorType: r5 > 0.6 ? 1 : r5 > 0.2 ? 0 : 2, // 3 tone branding colors
			});
		}
		return generatedNodes;
	}, []);

	// --- 2. LOOP MECHANICS (THE MATHEMATICS OF SEAMLESS LOOPING) ---
	// To make a video loop seamlessly, any moving angle must complete a full multiple of 2*PI.
	// Progress goes from 0 to 1 over the duration of the video.
	const loopProgress = frame / durationInFrames;
	const loopAngle = loopProgress * Math.PI * 2;

	// --- 3. COMPUTE ANIMATED POSITIONS FOR CURRENT FRAME ---
	const animatedNodes = useMemo(() => {
		return nodes.map((node) => {
			// By multiplying loopAngle with integers, we guarantee the object 
			// returns exactly to its starting coordinate at frame == durationInFrames.
			const angleX = node.phaseX + loopAngle * Math.floor(node.speedX);
			const angleY = node.phaseY + loopAngle * Math.floor(node.speedY);

			// Lissajous / Lissajous-like organic path movement
			const x = node.baseX + Math.sin(angleX) * node.radiusX;
			const y = node.baseY + Math.cos(angleY) * node.radiusY;

			// Breathing pulse effect for nodes that also loops perfectly
			const pulseAngle = loopAngle * Math.floor(node.pulseSpeed);
			const pulseScale = 1 + Math.sin(pulseAngle) * 0.25;

			return {
				...node,
				x,
				y,
				scale: pulseScale, // Menghapus entrySpring agar seamless loop
			};
		});
	}, [nodes, loopAngle, frame, fps]);

	// --- 4. CALCULATE CONNECTIONS dynamically based on proximity ---
	const connections: ConnectionItem[] = useMemo(() => {
		const activeConnections: ConnectionItem[] = [];
		for (let i = 0; i < animatedNodes.length; i++) {
			for (let j = i + 1; j < animatedNodes.length; j++) {
				const n1 = animatedNodes[i];
				const n2 = animatedNodes[j];

				const dx = n1.x - n2.x;
				const dy = n1.y - n2.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < CONNECTION_DISTANCE) {
					activeConnections.push({ from: n1, to: n2 });
				}
			}
		}
		return activeConnections;
	}, [animatedNodes]);

	// Palette system setup: Premium Abstract Corporate (Deep Slate, Cyan, Tech Blue, Indigo Accent)
	const getColor = (type: number, opacity: number) => {
		if (type === 0) return `rgba(0, 229, 255, ${opacity})`; // Vibrant Cyan
		if (type === 1) return `rgba(41, 121, 255, ${opacity})`; // Tech Blue
		return `rgba(101, 31, 255, ${opacity})`; // Electric Indigo
	};

	// Ambient overall grid overlay animation to provide deep technological space illusion
	const backgroundGridOpacity = interpolate(
		Math.sin(loopAngle),
		[-1, 1],
		[0.12, 0.25]
	);

	return (
		<AbsoluteFill style={{
			backgroundColor: '#0a0f1d',
			overflow: 'hidden',
			width: CANVAS_WIDTH,
			height: CANVAS_HEIGHT,
		}}>
			{/* --- BACKGROUND GLOW & DEEP MATRIX TECH EFFECTS --- */}
			<div style={{
				position: 'absolute',
				width: '100%',
				height: '100%',
				backgroundImage: `
					linear-gradient(rgba(255, 255, 255, ${backgroundGridOpacity}) 1px, transparent 1px),
					linear-gradient(90deg, rgba(255, 255, 255, ${backgroundGridOpacity}) 1px, transparent 1px)
				`,
				backgroundSize: '120px 120px',
				backgroundPosition: 'center center',
				pointerEvents: 'none',
			}} />

			{/* Large Ambient Blurred Background Glows */}
			<div style={{
				position: 'absolute',
				top: '20%',
				left: '15%',
				width: '800px',
				height: '800px',
				borderRadius: '50%',
				background: 'radial-gradient(circle, rgba(0, 229, 255, 0.08) 0%, transparent 70%)',
				filter: 'blur(60px)',
				transform: `translate(${Math.sin(loopAngle) * 50}px, ${Math.cos(loopAngle) * 50}px)`,
			}} />

			<div style={{
				position: 'absolute',
				bottom: '15%',
				right: '10%',
				width: '1000px',
				height: '1000px',
				borderRadius: '50%',
				background: 'radial-gradient(circle, rgba(101, 31, 255, 0.06) 0%, transparent 70%)',
				filter: 'blur(80px)',
				transform: `translate(${Math.cos(loopAngle) * -40}px, ${Math.sin(loopAngle) * 60}px)`,
			}} />

			{/* --- SVG CANVAS FOR RENDERING NETWORK LINES --- */}
			<svg style={{
				position: 'absolute',
				width: CANVAS_WIDTH,
				height: CANVAS_HEIGHT,
				top: 0,
				left: 0,
				pointerEvents: 'none',
			}}>
				<defs>
					{/* Gradient defines for sleek futuristic data flows */}
					<linearGradient id="grad-cyan-blue" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
						<stop offset="100%" stopColor="#2979ff" stopOpacity="0.4" />
					</linearGradient>
					<linearGradient id="grad-blue-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#2979ff" stopOpacity="0.4" />
						<stop offset="100%" stopColor="#651fff" stopOpacity="0.4" />
					</linearGradient>

					{/* Glow filters for high-end look */}
					<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
						<feGaussianBlur stdDeviation="6" result="blur" />
						<feComposite in="SourceGraphic" in2="blur" operator="over" />
					</filter>
				</defs>

				{/* Render Connections / Data Links */}
				{connections.map((conn, idx) => {
					const dx = conn.from.x - conn.to.x;
					const dy = conn.from.y - conn.to.y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					// Menghitung animasi pulsa energi (seamless)
					// Gunakan strokeDashoffset untuk membuat garis seolah mengalir
					const pulseSpeed = 2 + (idx % 3);
					const dashOffset = -frame * pulseSpeed;

					// Line fades out dynamically as distance approaches the maximum threshold limit
					const lineOpacity = interpolate(
						distance,
						[0, CONNECTION_DISTANCE],
						[1, 0.5], // Meningkatkan opasitas agar garis lebih terlihat
						{ extrapolateRight: 'clamp' }
					);

					// Determine gradient usage or standard stroke coloring
					const strokeColor = idx % 2 === 0 ? 'url(#grad-cyan-blue)' : 'url(#grad-blue-indigo)';

					return (
						<g key={`line-group-${idx}`}>
							{/* Garis Dasar */}
							<line
								x1={conn.from.x}
								y1={conn.from.y}
								x2={conn.to.x}
								y2={conn.to.y}
								stroke={strokeColor}
								strokeWidth={interpolate(distance, [0, CONNECTION_DISTANCE], [4, 1.5])}
								strokeOpacity={lineOpacity * 0.4}
							/>
							{/* Pulsa Energi Bergerak (Neon Pulse) */}
							<line
								x1={conn.from.x}
								y1={conn.from.y}
								x2={conn.to.x}
								y2={conn.to.y}
								stroke={idx % 2 === 0 ? "#00e5ff" : "#651fff"}
								strokeWidth={interpolate(distance, [0, CONNECTION_DISTANCE], [5, 2])}
								strokeOpacity={lineOpacity}
								strokeDasharray="40, 120"
								strokeDashoffset={dashOffset}
							/>
						</g>
					);
				})}

				{/* Render Animated Dynamic Shooting Star Data Packets across lines */}
				{connections.filter((_, i) => i % 6 === 0).map((conn, idx) => {
					// Perfectly looped interpolation factor for the data flow packet
					const packetLoopPhase = (loopProgress + (idx * 0.17)) % 1.0;

					const currentX = interpolate(packetLoopPhase, [0, 1], [conn.from.x, conn.to.x]);
					const currentY = interpolate(packetLoopPhase, [0, 1], [conn.from.y, conn.to.y]);

					// Pulse opacity of individual packets so they vanish beautifully at boundaries
					const packetOpacity = interpolate(
						packetLoopPhase,
						[0, 0.1, 0.9, 1],
						[0, 1, 1, 0]
					);

					return (
						<g key={`packet-group-${idx}`}>
							{/* Cahaya Pendar (Glow) untuk paket data */}
							<circle
								cx={currentX}
								cy={currentY}
								r={6}
								fill="#ffffff"
								opacity={packetOpacity * 0.5}
								filter="url(#glow)"
							/>
							<circle
								cx={currentX}
								cy={currentY}
								r={2.5}
								fill="#ffffff"
								opacity={packetOpacity}
							/>
						</g>
					);
				})}
			</svg>

			{/* --- HTML ELEMENTS FOR HIGH ACCURACY NODE RENDERING --- */}
			{animatedNodes.map((node) => {
				const isHighlighted = node.id % 8 === 0;
				const baseColor = getColor(node.colorType, 1);
				const auraColor = getColor(node.colorType, 0.15);

				return (
					<div
						key={`node-wrapper-${node.id}`}
						style={{
							position: 'absolute',
							left: node.x,
							top: node.y,
							transform: `translate(-50%, -50%) scale(${node.scale})`,
							width: node.size * 6,
							height: node.size * 6,
							display: 'block',
							pointerEvents: 'none',
						}}
					>
						{/* Outer Ring Ambient Wave Layer */}
						<div style={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							borderRadius: '50%',
							border: `1px solid ${getColor(node.colorType, 0.4)}`,
							transform: `scale(${1.3 + Math.sin(loopAngle * 3 + node.id) * 0.2})`,
						}} />

						{/* Highlight Tech UI Elements for Premium Micro-details */}
						{isHighlighted && (
							<div style={{
								position: 'absolute',
								top: '-8px',
								left: '-8px',
								right: '-8px',
								bottom: '-8px',
								borderRadius: '50%',
								border: `1.5px dashed ${baseColor}`,
								animation: 'none',
								transform: `rotate(${frame * 0.5 + (node.id * 10)}deg)`,
							}} />
						)}

						{/* Deep Soft Glow Backdrop Behind the Node */}
						<div style={{
							position: 'absolute',
							top: '15%',
							left: '15%',
							width: '70%',
							height: '70%',
							borderRadius: '50%',
							backgroundColor: baseColor,
							boxShadow: `0 0 ${node.size * 4}px ${node.size * 1.5}px ${baseColor}`,
							opacity: 0.7,
						}} />

						{/* Solid Central Hard Core */}
						<div style={{
							position: 'absolute',
							top: '25%',
							left: '25%',
							width: '50%',
							height: '50%',
							borderRadius: '50%',
							backgroundColor: isHighlighted ? '#ffffff' : baseColor,
							border: isHighlighted ? `2px solid ${baseColor}` : 'none',
						}} />

						{/* Small Technological Coordinate Text/Label simulation underneath nodes */}
						{isHighlighted && (
							<div style={{
								position: 'absolute',
								top: '120%',
								left: '50%',
								transform: 'translateX(-50%)',
								color: 'rgba(255, 255, 255, 0.45)',
								fontFamily: '"Courier New", Courier, monospace',
								fontSize: '14px',
								whiteSpace: 'nowrap',
								letterSpacing: '1px',
							}}>
								{`N_0${node.id}[${Math.floor(node.x / 10)},${Math.floor(node.y / 10)}]`}
							</div>
						)}
					</div>
				);
			})}

			{/* --- OVERLAY CREATIVE TECH HUD LAYERS --- */}
			{/* Vignette border overlay to increase center visual depth */}
			<div style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				boxShadow: 'inset 0 0 300px rgba(0,0,0,0.85)',
				pointerEvents: 'none',
			}} />

			{/* --- DIGITAL SCANLINES OVERLAY --- */}
			<div style={{
				position: 'absolute',
				inset: 0,
				backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)',
				backgroundSize: '100% 4px',
				zIndex: 10,
				pointerEvents: 'none',
				opacity: 0.3,
			}} />

			{/* Decorative Corner Framing Crosshairs common in high-selling stock assets */}
			<div style={{ position: 'absolute', top: 60, left: 60, width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
			<div style={{ position: 'absolute', top: 60, left: 60, width: 2, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }} />

			<div style={{ position: 'absolute', top: 60, right: 60, width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
			<div style={{ position: 'absolute', top: 60, right: 60, width: 2, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }} />

			<div style={{ position: 'absolute', bottom: 60, left: 60, width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
			<div style={{ position: 'absolute', bottom: 60, left: 60, width: 2, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }} />

			<div style={{ position: 'absolute', bottom: 60, right: 60, width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
			<div style={{ position: 'absolute', bottom: 60, right: 60, width: 2, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }} />
		</AbsoluteFill>
	);
};
