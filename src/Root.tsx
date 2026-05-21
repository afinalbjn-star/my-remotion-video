import { Composition } from 'remotion';
import { HoloGeometricSynchronicity } from './HoloGeometricSynchronicity';
import { RetroBlackHole } from './RetroBlackHole';
import { AITechnologyTunnel } from './AITechnologyTunnel';
import { Oceancyber } from './Oceancyber';
import { QuantumHologramCore } from './QuantumHologramCore';
import { DistributedOrchestrator } from './DistributedOrchestrator';
import { PathogenMicroverse } from './PathogenMicroverse';
import { SocialMediaGrowth } from './SocialMediaGrowth';
import { MolecularHelix } from './MolecularHelix';
import { SynapticNetwork } from './SynapticNetwork';
import { CardioPulse } from './CardioPulse';
import { AquaBubbleRise } from './AquaBubbleRise';
import { QuantumFlux } from './QuantumFlux';
import { NebulaFogLoop } from './NebulaFogLoop';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadShareTech } from "@remotion/google-fonts/ShareTechMono";

export const RemotionRoot: React.FC = () => {
  loadInter();
  loadShareTech();

  return (
    <>
      <Composition
        id="QuantumFlux-4K"
        component={QuantumFlux}
        durationInFrames={600}
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="NebulaFogLoop-4K"
        component={NebulaFogLoop}
        durationInFrames={600} // 10 detik @ 60fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="AquaBubbleRise-4K"
        component={AquaBubbleRise}
        durationInFrames={600} // 10 detik @ 60fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="PathogenMicroverse-4K"
        component={PathogenMicroverse}
        durationInFrames={600} // 10 detik @ 60fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="DistributedOrchestrator-4K"
        component={DistributedOrchestrator}
        durationInFrames={600} // 10 detik @ 60fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="QuantumHologramCore-4K"
        component={QuantumHologramCore}
        durationInFrames={600} // 10 detik @ 60fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="Oceancyber"
        component={Oceancyber}
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
      <Composition
        id="SocialMediaGrowth-4K"
        component={SocialMediaGrowth}
        durationInFrames={600} // 10 detik @ 60fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="MolecularHelix"
        component={MolecularHelix}
        durationInFrames={600} // 10 detik @ 60fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="SynapticNetwork"
        component={SynapticNetwork}
        durationInFrames={600} // 10 detik @ 60fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="CardioPulse"
        component={CardioPulse}
        durationInFrames={600} // 10 detik @ 60fps
        fps={60}
        width={3840}
        height={2160}
      />
    </>
  );
};