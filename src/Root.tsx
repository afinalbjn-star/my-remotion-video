import { Composition } from 'remotion';
import { HoloGeometricSynchronicity } from './HoloGeometricSynchronicity';
import { RetroBlackHole } from './RetroBlackHole';
import { AITechnologyTunnel } from './AITechnologyTunnel';
import { CyberOceanWave } from './CyberOceanWave';
import { QuantumHologramCore } from './QuantumHologramCore';
import { autoLoadFont } from './AssetManager';

export const RemotionRoot: React.FC = () => {
  autoLoadFont('Inter'); // Ensure Inter font is loaded
  autoLoadFont('Share Tech Mono'); // Load technical monospace font

  return (
    <>
      <Composition
        id="QuantumHologramCore-4K"
        component={QuantumHologramCore}
        durationInFrames={600} // 10 detik @ 60fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="CyberOceanWave-4K"
        component={CyberOceanWave}
        durationInFrames={600} // 10 detik @ 60fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="AITechnologyTunnel-4K"
        component={AITechnologyTunnel}
        durationInFrames={600} // 10 detik @ 60fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="HoloGeometric-4K"
        component={HoloGeometricSynchronicity}
        durationInFrames={1200} // 20 detik @ 60fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="RetroBlackHole-4K"
        component={RetroBlackHole}
        durationInFrames={1200} // 20 detik total (2 loop x 10 detik)
        fps={60}
        width={3840}
        height={2160}
      />
    </>
  );
};