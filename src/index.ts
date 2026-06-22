export interface LiquidFilterProps {
    baseFrequencyX: number;
    baseFrequencyY: number;
    numOctaves: number;
    scale: number;
    seed: number;
}

export interface WaveBackgroundProps {
    imageSrc: string;
    filterId: string;
}

export interface CompProps {
    titleText: string;
    titleColor: string;
}

export const VIDEO_CONFIG = {
  width: 3840,
  height: 2160,
  fps: 60,
  durationInFrames: 600, // 10 detik
};
