import { Composition } from 'remotion';
import { InstitutionalLiquidityPulse } from './InstitutionalLiquidityPulse';
import { CorporateGrowthSeamless } from './CorporateGrowthSeamless';
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
    </>
  );
};