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


export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="BusinessStats"
        component={Nando}
        durationInFrames={300}
        fps={60}
        width={2560}
        height={1440}
      />
      <Composition
        id="DataStatsVideo"
        component={Vidku}
        durationInFrames={480}
        fps={60}
        width={2560}
        height={1440}
      />
      <Composition
        id="TheDataPulse"
        component={DataPulse}
        durationInFrames={600}
        fps={60}
        width={2560}
        height={1440}
      />
      <Composition
        id="CorporateGrowth"
        component={CorporateGrowth}
        durationInFrames={600}
        fps={60}
        width={2560}
        height={1440}
      />
      <Composition
        id="ArchitecturalDigitalFlow"
        component={ArchitecturalDigitalFlow}
        durationInFrames={600}
        fps={60}
        width={2560}
        height={1440}
      />
      <Composition
        id="RetroVortex"
        component={SwirlingVortex}
        durationInFrames={600}
        fps={60}
        width={2560}
        height={1440}
      />
      <Composition
        id="NeuralGridLoop"
        component={NeuralGridLoop}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DataViz"
        component={DataVizComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FinancialChart"
        component={FinancialChart}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
