import React from 'react';
import { Composition } from 'remotion';
import { SnowfallSky } from './SnowfallSky';

export const RemotionRoot = () => (
  <>
    <Composition
      id="SnowfallSky-4K"
      component={SnowfallSky}
      durationInFrames={600}
      fps={60}
      width={3840}
      height={2160}
    />
  </>
);
