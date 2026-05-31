import { Composition } from 'remotion';
import { MercuryScene } from './Scene';

export const MercuryVideo = () => {
    return (
        <Composition
            id="MercuryFlow"
            component={MercuryScene}
            durationInFrames={600} // 10 detik * 60 fps
            fps={60}
            width={3840}
            height={2160}
        />
    );
};