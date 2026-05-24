import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { BloodCell } from './BloodCell';

/**
 * BloodVesselAnimation renders a stylized blood‑vessel network (simple SVG) and
 * animates many BloodCell components moving along the network. The animation
 * runs for 600 frames (10 s @ 60 fps) and loops seamlessly by duplicating the
 * cells with an offset equal to the total duration.
 */
export const BloodVesselAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 60;
  const durationFrames = 600; // 10 seconds

  // Number of cells to render – enough for a dense flow.
  const cellCount = 30;

  // Base speed in pixels per second (adjust for desired flow).
  const speedPxPerSec = 300; // 300 px/s
  const speedPerFrame = speedPxPerSec / fps;

  // Generate an array of initial offsets (random) for each cell.
  const offsets = React.useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < cellCount; i++) {
      // Random start offset within the loop length.
      arr.push(Math.random() * durationFrames);
    }
    return arr;
  }, []);

  // Render background – a simple stylized vessel network using SVG.
  const background = (
    <svg
      width="3840"
      height="2160"
      viewBox="0 0 3840 2160"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Example: a few curvy paths representing vessels */}
      <path
        d="M 500,200 C 800,400 1200,100 1500,300 S 2200,600 2600,200"
        stroke="#ff4040"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 300,800 C 600,1000 1000,700 1300,900 S 1900,1200 2300,800"
        stroke="#ff6666"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
      {/* Add more paths as desired */}
    </svg>
  );

  // Helper to compute position of a cell based on frame and its offset.
  const getProgress = (offset: number) => {
    const total = (frame + offset) % durationFrames;
    return total / durationFrames; // 0‑1 loop fraction
  };

  // Map progress to a point on the first path using simple linear interpolation.
  // For demonstration, we’ll move cells along a straight diagonal line.
  const renderCells = offsets.map((offset, idx) => {
    const progress = getProgress(offset);
    const x = interpolate(progress, [0, 1], [0, 3840]);
    const y = interpolate(progress, [0, 1], [1080, 1080]); // horizontal line across centre
    return (
      <div
        key={idx}
        style={{
          position: 'absolute',
          left: x,
          top: y,
        }}
      >
        <BloodCell />
      </div>
    );
  });

  return (
    <div style={{ width: 3840, height: 2160, position: 'relative', overflow: 'hidden' }}>
      {background}
      {renderCells}
    </div>
  );
};
