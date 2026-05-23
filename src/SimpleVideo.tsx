import type React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const textStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: 'Inter, Arial, sans-serif',
  fontWeight: 800,
  letterSpacing: 0,
};

export const SimpleVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const intro = spring({
    frame,
    fps,
    config: {
      damping: 16,
      stiffness: 95,
    },
  });

  const glow = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    [0, 1, 0],
    {easing: Easing.inOut(Easing.ease)}
  );

  const circleShift = interpolate(frame, [0, durationInFrames], [-120, 120]);
  const titleY = interpolate(intro, [0, 1], [90, 0]);
  const titleOpacity = interpolate(frame, [0, 35], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const subtitleOpacity = interpolate(frame, [55, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outroOpacity = interpolate(frame, [300, 350], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(135deg, #09111f 0%, #152f40 42%, #2b5b4f 100%)',
        color: 'white',
        overflow: 'hidden',
        opacity: outroOpacity,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 24% 28%, rgba(255, 221, 89, 0.34), transparent 28%), radial-gradient(circle at 82% 72%, rgba(64, 211, 189, 0.38), transparent 30%)',
          transform: `translateX(${circleShift}px) scale(${1 + glow * 0.06})`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 96,
          border: '2px solid rgba(255, 255, 255, 0.16)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 170,
          right: 170,
          top: 260,
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
        }}
      >
        <p
          style={{
            ...textStyle,
            color: '#ffde59',
            fontSize: 44,
            textTransform: 'uppercase',
          }}
        >
          Remotion Studio
        </p>
        <h1
          style={{
            ...textStyle,
            maxWidth: 1180,
            fontSize: 132,
            lineHeight: 1.02,
          }}
        >
          Video sederhana untuk Nando
        </h1>
      </div>

      <p
        style={{
          ...textStyle,
          position: 'absolute',
          left: 180,
          bottom: 230,
          maxWidth: 950,
          fontSize: 52,
          fontWeight: 500,
          lineHeight: 1.25,
          opacity: subtitleOpacity,
        }}
      >
        Dibuat dengan React, animasi frame-by-frame, dan siap dirender ke MP4.
      </p>

      <div
        style={{
          position: 'absolute',
          right: 190,
          bottom: 155,
          width: 360,
          height: 12,
          background: 'rgba(255, 255, 255, 0.18)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${interpolate(frame, [0, durationInFrames], [0, 100])}%`,
            background: '#ffde59',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
