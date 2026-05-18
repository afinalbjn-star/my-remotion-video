import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Nando } from "./nando";
import { CorporateGrowth } from "./CorporateGrowth";
import { LoopingDashboard } from "./looping";
import { CorporateGrowthSeamless } from "./CorporateGrowthSeamless";


export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Test"
        component={() => <div style={{ color: 'white', fontSize: 50 }}>Halo Dunia</div>}
        durationInFrames={60}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BusinessStats"
        component={Nando}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CorporateGrowth"
        component={CorporateGrowth}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Looping-Crypto-Dashboard-4K"
        component={LoopingDashboard}
        durationInFrames={2400}
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="CorporateGrowth-Seamless"
        component={CorporateGrowthSeamless}
        durationInFrames={600}
        fps={60}
        width={3840}
        height={2160}
      />
    </>
  );
};
