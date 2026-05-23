import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { ThreeCanvas } from '@remotion/three';

/**
 * BloodCell component renders a single animated blood cell using a 3D sphere.
 * It moves along the Z‑axis (forward and backward), rotates around its Z‑axis,
 * and fades in/out via opacity. The animation is driven by Remotion's
 * `useCurrentFrame` and `interpolate` helpers.
 */
export const BloodCell: React.FC = () => {
  const frame = useCurrentFrame();

  // 10‑second video at 60 fps => 600 frames, but we use 360 frames for this component.
  // Z‑position: start at 0, move forward to 500 at halfway, then back to 0.
  const z = interpolate(frame, [0, 180, 360], [0, 500, 0]);
  // Rotation around Z‑axis: full spin over the duration.
  const rotation = interpolate(frame, [0, 360], [0, Math.PI * 2]);
  // Opacity fades in, stays, then fades out.
  const opacity = interpolate(frame, [0, 30, 330, 360], [0, 1, 1, 0]);

  return (
    <ThreeCanvas
      width={3840}
      height={2160}
      camera={{ position: [0, 0, 1000] }}
    >
      {/* Simple lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 0, 1]} intensity={0.8} />

      <mesh position={[0, 0, z]} rotation={[0, 0, rotation]}>
        {/* A sphere approximating a blood cell */}
        <sphereGeometry args={[200, 32, 32]} />
        <meshStandardMaterial
          color="#ff4d4d"
          transparent
          opacity={opacity}
        />
      </mesh>
    </ThreeCanvas>
  );
};
