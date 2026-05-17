import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Nando } from "./nando";
import { Vidku } from "./vidku";
import { DataPulse } from "./DataPulse";
import { CorporateGrowth } from "./CorporateGrowth";
import { ArchitecturalDigitalFlow } from "./ArchitecturalDigitalFlow";
import { SwirlingVortex } from "./SwirlingVortex";
import { NeuralGridLoop } from "./NeuralGridLoop";
import { DataVizComposition } from "./DataVizComposition";
import { FinancialChart } from "./FinancialChart";
import { LoopingDashboard } from "./looping";


export const RemotionRoot: React.FC = () => {
  return (
    <>
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
        id="DataStatsVideo"
        component={Vidku}
        durationInFrames={480}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TheDataPulse"
        component={DataPulse}
        durationInFrames={600}
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
        id="ArchitecturalDigitalFlow"
        component={ArchitecturalDigitalFlow}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RetroVortex"
        component={SwirlingVortex}
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
        id="Tech-Neural-Grid-2K"
        component={NeuralGridLoop}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Social-Growth-Stats"
        component={DataVizComposition}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
