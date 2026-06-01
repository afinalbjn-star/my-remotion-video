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