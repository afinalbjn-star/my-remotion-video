import { Composition } from 'remotion';
import { InstitutionalLiquidityPulse } from './InstitutionalLiquidityPulse';
import { CorporateGrowthSeamless } from './CorporateGrowthSeamless';
import { CyberIntelligenceGrid } from './CyberIntelligenceGrid';
import { StockMarketSeamless } from './StockMarketSeamless';
import { QuantumCandlestickFlow } from './QuantumCandlestickFlow';
import { CorporateGrowth } from './CorporateGrowth';
import { LoopingDashboard } from './looping';
import { Nando } from './nando';
import { NeuralDataCore } from './NeuralDataCore';
import { CognitiveArchitecture } from './CognitiveArchitecture';
import { HoloGeometricSynchronicity } from './HoloGeometricSynchronicity';
import { autoLoadFont } from './AssetManager';

export const RemotionRoot: React.FC = () => {
  autoLoadFont('Inter'); // Ensure Inter font is loaded

  return (
    <>
      {/* Standar Resolusi Ultra: 8K (7680x4320) @ 60FPS */}

      <Composition
        id="QuantumCandlestickFlow"
        component={QuantumCandlestickFlow}
        durationInFrames={1200} // 20 seconds @ 60 fps
        fps={60}
        width={3840}
        height={2160}
      />

      <Composition
        id="StockMarketSeamless"
        component={StockMarketSeamless}
        durationInFrames={1200} // 20 detik @ 60 fps
        fps={60}
        width={7680}
        height={4320}
      />

      <Composition
        id="CyberIntelligenceGrid"
        component={CyberIntelligenceGrid}
        durationInFrames={1200} // 20 detik @ 60 fps
        fps={60}
        width={7680}
        height={4320}
      />

      <Composition
        id="LoopingDashboard"
        component={LoopingDashboard}
        durationInFrames={1200} // 20 detik @ 60 fps
        fps={60}
        width={7680}
        height={4320}
      />

      <Composition
        id="InstitutionalLiquidityPulse"
        component={InstitutionalLiquidityPulse}
        durationInFrames={1200} // 20 detik @ 60 fps
        fps={60}
        width={7680}
        height={4320}
        defaultProps={{ coinSymbol: "BTC" }}
      />

      <Composition
        id="CorporateGrowth-Seamless"
        component={CorporateGrowthSeamless}
        durationInFrames={1200} // 20 detik @ 60 fps
        fps={60}
        width={7680}
        height={4320}
      />

      <Composition
        id="CorporateGrowth-Typography"
        component={CorporateGrowth}
        durationInFrames={1200} // 20 detik @ 60 fps
        fps={60}
        width={7680}
        height={4320}
      />

      <Composition
        id="Nando-BusinessGrowth"
        component={Nando}
        durationInFrames={1200} // 20 detik @ 60 fps
        fps={60}
        width={7680}
        height={4320}
      />

      <Composition
        id="NeuralDataCore-8K"
        component={NeuralDataCore}
        durationInFrames={1200}
        fps={60}
        width={3840}
        height={2160}
      />

      <Composition
        id="CognitiveArchitecture-4K"
        component={CognitiveArchitecture}
        durationInFrames={1200} // 20 detik @ 60fps untuk loop seamless yang halus
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
    </>
  );
};