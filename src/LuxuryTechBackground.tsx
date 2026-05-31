import React from 'react';
import { TRACES_A } from './pcb/TracesA';
import { TRACES_B } from './pcb/TracesB';
import { NODES_A } from './pcb/NodesA';
import { NODES_PULSE } from './pcb/NodesPulse';
import { ENERGY_BRIDGES } from './pcb/EnergyBridges';

export const LOOP_DURATION = 600;

export const LuxuryTechBackground: React.FC = () => {
    return (
        <svg
            width="3840"
            height="2160"
            viewBox="0 0 3840 2160"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                backgroundColor: 'black',
            }}
        >
            <g dangerouslySetInnerHTML={{ __html: TRACES_A }} />
            <g dangerouslySetInnerHTML={{ __html: TRACES_B }} />
            <g dangerouslySetInnerHTML={{ __html: NODES_A }} />
            <g dangerouslySetInnerHTML={{ __html: NODES_PULSE }} />
            <g dangerouslySetInnerHTML={{ __html: ENERGY_BRIDGES }} />
        </svg>
    );
};
