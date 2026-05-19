import { Composition } from 'remotion';
import { InstitutionalLiquidityPulse } from './InstitutionalLiquidityPulse';
import { CorporateGrowthSeamless } from './CorporateGrowthSeamless';
import { CyberIntelligenceGrid } from './CyberIntelligenceGrid';
import { StockMarketSeamless } from './StockMarketSeamless';
import { QuantumCandlestickFlow } from './QuantumCandlestickFlow';
import { autoLoadFont } from './AssetManager';

export const RemotionRoot: React.FC = () => {
  autoLoadFont('Inter'); // Ensure Inter font is loaded

  return (
    <>
      <Composition
        id="InstitutionalLiquidityPulse"
        component={InstitutionalLiquidityPulse}
        durationInFrames={300} // 10 seconds * 30 fps
        fps={30}
        width={3840} // Increased to 4K width
        height={2160} // Increased to 4K height
        defaultProps={{ coinSymbol: "BTC" }}
      />
      <Composition
        id="CorporateGrowth-Seamless"
        component={CorporateGrowthSeamless}
        durationInFrames={300}
        fps={30}
        width={3840}
        height={2160}
      />
      <Composition
        id="CyberIntelligenceGrid"
        component={CyberIntelligenceGrid}
        durationInFrames={1200} // 20 seconds * 60 fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="StockMarketSeamless"
        component={StockMarketSeamless}
        durationInFrames={900} // 15 seconds * 60 fps
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="QuantumCandlestickFlow"
        component={QuantumCandlestickFlow}
        durationInFrames={900} // 15 detik * 60 fps
        fps={60}
        width={3840}
        height={2160}
      />
    </>
  );
};