import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence, random } from 'remotion';
import React, { useMemo } from 'react';

// === HELPER COMPONENTS ===

const GridBackground: React.FC = () => {
  return (
    <AbsoluteFill style={{
      backgroundColor: '#0d0e15',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(130, 130, 255, 0.04) 0%, transparent 60%)',
    }}>
      {/* Dot Grid */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.6,
      }} />

      {/* Y-Axis lines */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '200px 0', opacity: 0.2
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ width: '100%', height: '1px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', color: 'white', marginLeft: '40px', marginTop: '-25px', fontSize: '20px' }}>
              LVL_{100 - i * 20}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const DataStreamText: React.FC = () => {
  const frame = useCurrentFrame();
  const strings = useMemo(() => {
    return new Array(20).fill(0).map((_, i) => {
      const charCode = () => Math.floor(random(`char-${i}-${frame}`) * 26) + 65;
      return String.fromCharCode(charCode(), charCode(), charCode(), charCode()) + `-${Math.floor(random(`num-${i}`) * 9999)}`;
    });
  }, [frame]);

  return (
    <div style={{
      position: 'absolute', top: '50px', left: '50px',
      display: 'flex', flexDirection: 'column', gap: '10px',
      fontFamily: 'Share Tech Mono, monospace', color: 'rgba(0, 240, 255, 0.4)', fontSize: '18px',
    }}>
      {strings.slice(0, 8).map((str, i) => (
        <div key={i}>[DATA] {str} // {Math.floor(random(`val-${i}-${frame}`) * 100)}%</div>
      ))}
    </div>
  );
};

// === INTRO COMPONENT ===

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const translateY = spring({
    frame: frame - 20, // delay start slightly
    fps,
    config: { damping: 14, mass: 1 },
    from: 100,
    to: 0,
  });
  
  const opacity = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const fadeOutOpacity = interpolate(frame, [150, 180], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Glitch text effect
  const isGlitch = frame > 40 && frame < 50 && frame % 3 === 0;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: fadeOutOpacity }}>
      <div style={{ transform: `translateY(${translateY}px)`, opacity }}>
        <h1
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '120px',
            fontWeight: '900',
            color: 'white',
            letterSpacing: '-2px',
            textTransform: 'uppercase',
            textShadow: isGlitch ? '5px 0 0 #00F0FF, -5px 0 0 #FF0055' : '0 0 40px rgba(255,255,255,0.2)',
            margin: 0,
            position: 'relative'
          }}
        >
          [ Social Media Growth ]
        </h1>
        <p style={{
          fontFamily: 'Share Tech Mono, monospace', fontSize: '30px', color: '#00F0FF', textAlign: 'center', marginTop: '20px',
          letterSpacing: '8px', opacity: 0.8
        }}>
          SYSTEM ENGAGED
        </p>
      </div>
    </AbsoluteFill>
  );
};

// === DATA SURGE COMPONENT ===

const PremiumBar: React.FC<{ 
  color: string, 
  value: number, 
  heightPx: number, 
  label: string, 
  percentage: number 
}> = ({ color, value, heightPx, label, percentage }) => {
  const frame = useCurrentFrame();
  const borderOpacity = Math.sin(frame / 5) * 0.2 + 0.8;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', position: 'relative' }}>
      {/* Percentage Indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        backgroundColor: 'rgba(0, 255, 170, 0.1)', border: '1px solid rgba(0, 255, 170, 0.5)',
        padding: '10px 20px', borderRadius: '50px',
        boxShadow: '0 0 20px rgba(0, 255, 170, 0.2)',
        opacity: heightPx > 50 ? 1 : 0, transition: 'opacity 0.3s'
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FFAA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
        <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '36px', color: '#00FFAA', fontWeight: 'bold' }}>
          +{percentage}%
        </span>
      </div>

      {/* Main Value */}
      <h2 style={{ 
        fontFamily: 'Share Tech Mono, monospace', 
        fontSize: '110px', 
        color, 
        margin: 0,
        textShadow: `0 0 30px ${color}`
      }}>
        {value.toLocaleString()}
      </h2>
      
      {/* The Bar */}
      <div style={{
        width: '240px',
        height: `${heightPx}px`,
        background: `linear-gradient(to top, rgba(0,0,0,0.5), ${color}80)`, // glassmorphism gradient
        border: `3px solid ${color}`,
        borderBottom: 'none',
        borderRadius: '10px 10px 0 0',
        position: 'relative',
        boxShadow: `0 0 50px ${color}40`,
        opacity: borderOpacity
      }}>
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: '-20px', right: '-20px', height: '6px', backgroundColor: 'white', boxShadow: '0 0 20px white' }} />
        {/* Inner grid/segments */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, ${color}40 20px)`,
        }} />
      </div>

      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ color, fontSize: '40px', fontFamily: 'Share Tech Mono, monospace' }}>{`//`}</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '60px', color: 'white', fontWeight: 'bold', letterSpacing: '4px' }}>{label}</span>
      </div>
    </div>
  );
};

const DataSurge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Easing function for numbers (starts fast, slows down)
  const progress = spring({
    frame,
    fps,
    config: { damping: 100, mass: 1, stiffness: 50 }, // Slow smooth arrival
    durationInFrames: 180,
  });

  const followersCount = Math.floor(progress * 154200);
  const engagementCount = Math.floor(progress * 45800);
  const followersPerc = Math.floor(progress * 458);
  const engagementPerc = Math.floor(progress * 230);

  const followersHeight = progress * 800;
  const engagementHeight = progress * 550;

  return (
    <AbsoluteFill style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '200px', gap: '250px' }}>
      <PremiumBar 
        color="#00F0FF" 
        value={followersCount} 
        heightPx={followersHeight} 
        label="FOLLOWERS" 
        percentage={followersPerc}
      />
      <PremiumBar 
        color="#FF0055" 
        value={engagementCount} 
        heightPx={engagementHeight} 
        label="ENGAGEMENT" 
        percentage={engagementPerc}
      />
    </AbsoluteFill>
  );
};

// === OUTRO COMPONENT ===

const PremiumIcon: React.FC<{
    d: string; 
    color: string; 
    left: string; 
    top: string; 
    delay: number 
}> = ({ d, color, left, top, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Floating hover effect
  const hoverY = Math.sin(Math.max(0, frame - delay) / 15) * 20;
  
  // Spring pop-in
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.8 },
  });

  // Ripple effect (expanding ring)
  const rippleScale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20 },
  }) * 2;
  const rippleOpacity = interpolate(frame - delay, [0, 30], [0.8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', left, top, transform: `translate(-50%, -50%) translateY(${hoverY}px)` }}>
      {/* Ripple */}
      {frame >= delay && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${rippleScale})`,
          width: '150px', height: '150px', borderRadius: '50%',
          border: `4px solid ${color}`, opacity: rippleOpacity,
        }} />
      )}
      
      {/* Icon Background */}
      <div style={{
        transform: `scale(${scale})`,
        width: '160px', height: '160px',
        backgroundColor: `${color}1A`, // very transparent
        backdropFilter: 'blur(10px)',
        border: `2px solid ${color}`,
        borderRadius: '30px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: `0 0 50px ${color}60, inset 0 0 20px ${color}40`,
      }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill={color} style={{ filter: `drop-shadow(0px 0px 10px ${color})` }}>
          <path d={d} />
        </svg>
      </div>
    </div>
  );
};

const OutroIcons: React.FC = () => {
    const likePath = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
    const commentPath = "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z";
    const sharePath = "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z";

    return (
        <AbsoluteFill>
            <PremiumIcon d={likePath} color="#FF0055" left="25%" top="40%" delay={0} />
            <PremiumIcon d={commentPath} color="#00F0FF" left="50%" top="20%" delay={20} />
            <PremiumIcon d={sharePath} color="#00FFAA" left="75%" top="40%" delay={40} />
        </AbsoluteFill>
    );
};

// === MAIN COMPOSITION ===

export const SocialMediaGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Fade out at the end for seamless looping
  const loopOpacity = interpolate(frame, [570, 600], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0d0e15' }}>
      <AbsoluteFill style={{ opacity: loopOpacity }}>
        {/* Persistent Background Elements */}
        <GridBackground />
        <DataStreamText />

        {/* Intro (0-3 seconds) */}
        <Sequence from={0} durationInFrames={180}>
          <Title />
        </Sequence>
        
        {/* Data Surge (Starts at 3 seconds, persists until end) */}
        <Sequence from={180} durationInFrames={420}>
           <DataSurge />
        </Sequence>

        {/* Outro Icons (Starts at 7 seconds, persists until end) */}
        <Sequence from={420} durationInFrames={180}>
           <OutroIcons />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
