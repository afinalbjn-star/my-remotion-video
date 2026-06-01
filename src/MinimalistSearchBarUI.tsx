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
const CANVAS_WIDTH = 3840;
const CANVAS_HEIGHT = 2160;

// Typing text assets popular on Adobe Stock
const SEARCH_KEYWORDS = [
	"Artificial Intelligence",
	"Sustainable Energy",
	"Future of Technology"
];

export const MinimalistSearchBarUI: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	// --- CONSTANTS FOR TIME ALLOCATION (TOTAL 300 FRAMES / 10s @ 30fps) ---
	// To make it seamless, the entire loop must return to the initial state (empty clean screen or resetting layout)
	const F_CURSOR_IN = 15;   // Frame 0-15: Cursor floats into center
	const F_BAR_EXPAND = 35;   // Frame 15-35: Search bar expands from center point
	const F_START_TYPING = 45;   // Frame 35-45: Pause before typing
	const F_END_TYPING = 135;  // Frame 45-135: Text is typed out letter by letter
	const F_START_SEARCH = 150;  // Frame 135-150: Pause with full text, cursor blinking
	const F_CLICK_ACTION = 160;  // Frame 150-160: Cursor clicks search button (scale animation)
	const F_SHOW_LOADER = 165;  // Frame 160-165: Search bar converts into subtle tech loader
	const F_LOADER_LOOP = 245;  // Frame 165-245: High-end tech circular loader spinning
	const F_REVEAL_RESULT = 265;  // Frame 245-265: Success flash & dashboard framework preview lines fade in
	const F_FADE_OUT = 300;  // Frame 265-300: Everything smoothly dissolves to absolute zero for flawless looping

	// Full text to render
	const fullText = SEARCH_KEYWORDS[0];

	// --- ANIMATION STEP LOGIC SYSTEM ---

	// 1. Mouse/Cursor Position Interpolations
	const cursorSpring = spring({
		frame: frame,
		fps,
		config: { damping: 14, mass: 0.8 },
	});

	// Cursor moves from bottom-right towards the search button area
	const cursorX = interpolate(cursorSpring, [0, 1], [CANVAS_WIDTH * 0.7, CANVAS_WIDTH * 0.5 + 340]);
	const cursorY = interpolate(cursorSpring, [0, 1], [CANVAS_HEIGHT * 0.8, CANVAS_HEIGHT * 0.5 + 5]);

	// Clicking animation (Frame 150 to 160)
	const clickSpring = spring({
		frame: frame - F_START_SEARCH,
		fps,
		config: { damping: 10, mass: 0.3 },
	});
	const cursorScale = interpolate(clickSpring, [0, 0.5, 1], [1, 0.75, 1]);

	// 2. Search Bar Growth Animation
	const barExpandSpring = spring({
		frame: frame - F_CURSOR_IN,
		fps,
		config: { damping: 16, mass: 1 },
	});
	const barWidth = interpolate(barExpandSpring, [0, 1], [120, 900]);
	const barHeight = interpolate(barExpandSpring, [0, 1], [120, 110]);
	const barOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: 'clamp' });
	const barBorderRadius = interpolate(barExpandSpring, [0, 1], [60, 24]);

	// 3. Typing Letter System
	const totalLetters = fullText.length;
	const currentLetterCount = Math.floor(
		interpolate(frame, [F_START_TYPING, F_END_TYPING], [0, totalLetters], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		})
	);
	const visibleText = fullText.substring(0, currentLetterCount);

	// Text cursor blinking sequence
	const isBlinking = frame < F_START_TYPING || (frame > F_END_TYPING && frame < F_SHOW_LOADER);
	const textCursorOpacity = isBlinking ? (Math.floor(frame / 6) % 2 === 0 ? 1 : 0) : 1;

	// 4. Transform Bar to Loader Layout Transition
	const loaderTransitionSpring = spring({
		frame: frame - F_CLICK_ACTION,
		fps,
		config: { damping: 15, mass: 0.9 },
	});

	// Morph the search bar box structure into a compact loader housing
	const finalBarWidth = interpolate(loaderTransitionSpring, [0, 1], [barWidth, 140]);
	const finalBarHeight = interpolate(loaderTransitionSpring, [0, 1], [barHeight, 140]);
	const finalBarRadius = interpolate(loaderTransitionSpring, [0, 1], [barBorderRadius, 70]);
	const contentFadeOut = interpolate(loaderTransitionSpring, [0, 0.4], [1, 0], { extrapolateRight: 'clamp' });

	// Loader Circular Progress System
	const loaderProgressProgress = interpolate(frame, [F_SHOW_LOADER, F_LOADER_LOOP], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const loaderRotation = interpolate(frame, [F_SHOW_LOADER, F_LOADER_LOOP], [0, 720]);
	const strokeDashoffset = 251.2 - (251.2 * loaderProgressProgress);

	// 5. Success Reveal Interface Simulation
	const revealSpring = spring({
		frame: frame - F_LOADER_LOOP,
		fps,
		config: { damping: 18, mass: 1 },
	});
	const resultScale = interpolate(revealSpring, [0, 1], [0.96, 1]);
	const resultOpacity = interpolate(revealSpring, [0, 1], [0, 1]);
	const mainComponentFadeOut = interpolate(revealSpring, [0, 0.5], [1, 0], { extrapolateRight: 'clamp' });

	// 6. Perfect Global Seamless Fade Out
	const globalFadeOutOpacity = interpolate(frame, [F_FADE_OUT - 20, F_FADE_OUT], [1, 0], {
		etrapolateLeft: 'clamp',
	});

	// Staggered reveal for result blocks
	const getStaggeredRevealProps = (index: number) => {
		const delay = index * 10; // Delay each block by 10 frames
		const staggeredFrame = frame - F_LOADER_LOOP - delay;

		const blockSpring = spring({
			frame: staggeredFrame,
			fps,
			config: { damping: 18, mass: 1 },
		});

		const opacity = interpolate(blockSpring, [0, 1], [0, 1], { extrapolateLeft: 'clamp' });
		const translateY = interpolate(blockSpring, [0, 1], [20, 0], { extrapolateLeft: 'clamp' });
		const scale = interpolate(blockSpring, [0, 1], [0.98, 1], { extrapolateLeft: 'clamp' });

		return { opacity, translateY, scale };
	};

	// UI Design Color Tokens (Ultra Premium Minimalist Dark Theme)
	const colors = {
		bg: '#05070f',
		surface: 'rgba(17, 21, 36, 0.7)', // Transparan untuk efek glassmorphism
		accent: '#2f66ff',
		accentGlow: 'rgba(47, 102, 255, 0.35)',
		textPrimary: '#ffffff',
		textSecondary: '#6e7a99',
		border: '#222b45',
		grid: 'rgba(255, 255, 255, 0.025)'
	};

	return (
		<AbsoluteFill style={{
			backgroundColor: colors.bg,
			width: CANVAS_WIDTH,
			height: CANVAS_HEIGHT,
			fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
			overflow: 'hidden',
			opacity: globalFadeOutOpacity
		}}>
			{/* --- BACKGROUND METRIC MATRIX GRID --- */}
			<div style={{
				position: 'absolute',
				width: '100%',
				height: '100%',
				backgroundImage: `
					linear-gradient(${colors.grid} 1.5px, transparent 1.5px),
					linear-gradient(90deg, ${colors.grid} 1.5px, transparent 1.5px)
				`,
				backgroundSize: '100px 100px',
				backgroundPosition: 'center center',
				pointerEvents: 'none',
			}} />

			{/* Soft decorative background asset shapes for market appeal */}
			<div style={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				width: '1400px',
				height: '1400px',
				background: 'radial-gradient(circle, rgba(47, 102, 255, 0.04) 0%, transparent 65%)',
				filter: 'blur(40px)',
				pointerEvents: 'none',
			}} />

			{/* --- MAIN UI INTERACTION WORKSPACE AREA --- */}
			<div style={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				display: 'block',
				textAlign: 'center',
			}}>

				{/* SEARCH BAR CONTAINER CONTAINER */}
				<div style={{
					width: finalBarWidth,
					height: finalBarHeight,
					backgroundColor: colors.surface,
					backdropFilter: 'blur(20px)', // Efek kaca buram
					border: `2px solid ${colors.border}`,
					borderRadius: finalBarRadius,
					boxShadow: frame > F_CLICK_ACTION ? `0 0 60px ${colors.accentGlow}` : '0 20px 50px rgba(0,0,0,0.5)',
					display: 'inline-block',
					position: 'relative',
					verticalAlign: 'middle',
					opacity: barOpacity,
					overflow: 'hidden',
					transition: 'box-shadow 0.3s ease',
				}}>

					{/* INNER SEARCH CONTENT LAYOUT (Fades out when morphing to loader) */}
					<div style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						top: 0,
						left: 0,
						opacity: contentFadeOut,
						display: 'block',
					}}>
						{/* Magnifying Glass Search Icon */}
						<div style={{
							position: 'absolute',
							left: '35px',
							top: '50%',
							transform: 'translateY(-50%)',
							width: '32px',
							height: '32px',
						}}>
							<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="11" cy="11" r="8"></circle>
								<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
							</svg>
						</div>

						{/* Interactive Running Typed Input Text Field */}
						<div style={{
							position: 'absolute',
							left: '90px',
							top: '50%',
							transform: 'translateY(-50%)',
							color: colors.textPrimary,
							fontSize: '34px',
							fontWeight: 500,
							letterSpacing: '-0.5px',
							textAlign: 'left',
							display: 'block',
							whiteSpace: 'nowrap',
						}}>
							{visibleText}
							{/* Simulated Text Insertion Point Cursor */}
							<span style={{
								display: 'inline-block',
								width: '3px',
								height: '36px',
								backgroundColor: colors.accent,
								marginLeft: '6px',
								verticalAlign: 'middle',
								opacity: textCursorOpacity,
							}} />
						</div>

						{/* Action Call-to-action Button Element inside bar */}
						<div style={{
							position: 'absolute',
							right: '16px',
							top: '50%',
							transform: 'translateY(-50%)',
							width: '160px',
							height: '74px',
							backgroundColor: frame >= F_START_SEARCH ? colors.accent : 'transparent',
							border: frame >= F_START_SEARCH ? `none` : `2px solid ${colors.border}`,
							borderRadius: '14px',
							display: 'block',
							transition: 'background-color 0.25s ease, border-color 0.25s ease',
						}}>
							<span style={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
								color: frame >= F_START_SEARCH ? colors.textPrimary : colors.textSecondary,
								fontSize: '22px',
								fontWeight: 600,
								letterSpacing: '0.5px'
							}}>
								Search
							</span>
						</div>
					</div>

					{/* INTEGRATED HIGH-END CIRCULAR TECH LOADER LAYER */}
					{frame >= F_CLICK_ACTION && (
						<div style={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							opacity: mainComponentFadeOut,
							display: 'block',
						}}>
							<svg
								width="140"
								height="140"
								viewBox="0 0 100 100"
								style={{
									transform: `rotate(${loaderRotation}deg)`,
									transformOrigin: '50% 50%',
									position: 'absolute',
									top: -2,
									left: -2
								}}
							>
								{/* Background Track Circle */}
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke={colors.border}
									strokeWidth="4"
								/>
								{/* Active Premium Linear Gradient Dash Segment */}
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke={colors.accent}
									strokeWidth="4"
									strokeDasharray="251.2"
									strokeDashoffset={strokeDashoffset}
									strokeLinecap="round"
								/>
							</svg>
							{/* Center processing mathematical metric ratio markup */}
							<div style={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
								color: colors.textSecondary,
								fontSize: '18px',
								fontFamily: 'monospace',
								fontWeight: 'bold',
							}}>
								{Math.floor(loaderProgressProgress * 100)}%
							</div>
						</div>
					)}
				</div>

				{/* --- SIMULATED COMPREHENSIVE PLATFORM DASHBOARD DASH SYSTEM --- */}
				{/* Appears smoothly after processing animation hits completion */}
				{frame >= F_LOADER_LOOP && (
					<div style={{
						position: 'absolute',
						top: '-200px',
						left: '50%',
						transform: `translateX(-50%)`, // Scale applied per block
						width: '1200px',
						height: '620px',
						backgroundColor: colors.surface,
						backdropFilter: 'blur(30px)', // Efek kaca lebih kuat pada dashboard
						border: `2px solid ${colors.border}`,
						borderRadius: '32px',
						boxShadow: '0 40px 90px rgba(0,0,0,0.65)',
						opacity: mainComponentFadeOut, // Apply main fade out here
						padding: '45px',
						textAlign: 'left',
						boxSizing: 'border-box',
						display: 'block'
					}}>
						{/* Tech Metric Card Subheader Row */}
						<div style={{
							display: 'block', marginBottom: '40px',
							opacity: getStaggeredRevealProps(0).opacity,
							transform: `translateY(${getStaggeredRevealProps(0).translateY}px) scale(${getStaggeredRevealProps(0).scale})`
						}}>
							<div style={{ display: 'inline-block', width: '24px', height: '24px', backgroundColor: colors.accent, borderRadius: '6px', marginRight: '16px', verticalAlign: 'middle' }} />
							<div style={{ display: 'inline-block', color: colors.textSecondary, fontSize: '20px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', verticalAlign: 'middle' }}>
								Query Result Database Dashboard
							</div>
						</div>

						{/* Wireframe Mockup Data Blocks Rows */}
						<div style={{ display: 'block', height: '140px', backgroundColor: 'rgba(255,255,255,0.015)', border: `1px dashed ${colors.border}`, borderRadius: '16px', marginBottom: '25px', padding: '30px' }}>
							<div style={{ width: '40%', height: '24px', backgroundColor: colors.textSecondary, opacity: 0.3, borderRadius: '6px', marginBottom: '20px' }} />
							<div style={{ width: '85%', height: '16px', backgroundColor: colors.textSecondary, opacity: 0.15, borderRadius: '4px', marginBottom: '12px' }} />
							<div style={{ width: '60%', height: '16px', backgroundColor: colors.textSecondary, opacity: 0.15, borderRadius: '4px' }} />
						</div>

						{/* Double Column Subgrid Elements */}
						<div style={{ display: 'block', width: '100%' }}>
							<table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
								<tbody>
									<tr>
										<td style={{ width: '50%', paddingRight: '15px', border: 'none' }}>
											<div style={{ height: '180px', backgroundColor: 'rgba(255,255,255,0.015)', border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '25px' }}>
												<div style={{ width: '30%', height: '18px', backgroundColor: colors.accent, opacity: 0.6, borderRadius: '4px', marginBottom: '25px' }} />
												<div style={{ width: '90%', height: '12px', backgroundColor: colors.textSecondary, opacity: 0.15, borderRadius: '4px', marginBottom: '12px' }} />
												<div style={{ width: '75%', height: '12px', backgroundColor: colors.textSecondary, opacity: 0.15, borderRadius: '4px', marginBottom: '12px' }} />
												<div style={{ width: '40%', height: '12px', backgroundColor: colors.textSecondary, opacity: 0.15, borderRadius: '4px' }} />
											</div>
										</td>
										<td style={{ width: '50%', paddingLeft: '15px', border: 'none' }}>
											<div style={{
												height: '180px', backgroundColor: 'rgba(255,255,255,0.015)', border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '25px',
												opacity: getStaggeredRevealProps(3).opacity,
												transform: `translateY(${getStaggeredRevealProps(3).translateY}px) scale(${getStaggeredRevealProps(3).scale})`
											}}>
												<div style={{ width: '50%', height: '18px', backgroundColor: colors.textSecondary, opacity: 0.3, borderRadius: '4px', marginBottom: '25px' }} />
												<div style={{ width: '80%', height: '12px', backgroundColor: colors.textSecondary, opacity: 0.15, borderRadius: '4px', marginBottom: '12px' }} />
												<div style={{ width: '85%', height: '12px', backgroundColor: colors.textSecondary, opacity: 0.15, borderRadius: '4px', marginBottom: '12px' }} />
												<div style={{ width: '55%', height: '12px', backgroundColor: colors.textSecondary, opacity: 0.15, borderRadius: '4px' }} />
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>

			{/* --- DIGITAL INTERACTION OS MOUSE POINTER ASSET --- */}
			{/* Only render and move cursor until clicking animation sequences complete */}
			{frame < F_CLICK_ACTION && (
				<div style={{
					position: 'absolute',
					left: cursorX,
					top: cursorY,
					transform: `scale(${cursorScale})`,
					width: '48px',
					height: '48px',
					pointerEvents: 'none',
					zIndex: 999,
					display: 'block',
				}}>
					<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						{/* Drop Shadow Filter styling built directly via inline vector path */}
						<path d="M4.5 3V17.25L9.105 13.065L13.815 21L16.815 19.335L12.195 11.58H18.75L4.5 3Z" fill="white" stroke="#000000" strokeWidth="2" strokeLinejoin="miter" />
					</svg>
				</div>
			)}

			{/* --- HUD FRAME DECORATIONS --- */}
			<div style={{ position: 'absolute', top: 80, left: 80, color: colors.textSecondary, fontFamily: 'monospace', fontSize: '18px', letterSpacing: '2px', fontWeight: 'bold' }}>
				SYS_MOCKUP_INTERFACE // ACTIVE
			</div>
			<div style={{ position: 'absolute', bottom: 80, right: 80, color: colors.textSecondary, fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold' }}>
				FPS_30.00 // RESOLUTION_4K
			</div>
		</AbsoluteFill>
	);
};
