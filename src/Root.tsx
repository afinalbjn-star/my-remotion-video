import React from 'react';
import { Composition } from 'remotion';
import { AbstractCosmicBackground } from './AbstractCosmicBackground';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="AbstractCosmicBackground"
        component={AbstractCosmicBackground}
        durationInFrames={600}
        fps={60}
        width={3840}
        height={2160}
      />
    </>
  );
};