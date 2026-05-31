import { Composition } from 'remotion';
import { TechnologyScene } from './Scene';

export const TechnologyVideo = () => {
    return (
        <Composition
            id="TechnologyBackground"
            component={TechnologyScene}
            durationInFrames={600}
            fps={60}
            width={3840}
            height={2160}
        />
    );
};