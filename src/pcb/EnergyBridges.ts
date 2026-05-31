/**
 * EnergyBridges — PURE STRING VERSION (Formatter‑proof)
 * EXTREME PCB energy connections:
 * - bright flowing gold beams linking CPU nodes
 * - uses SVG animate for seamless looping (10s = 600 frames @ 60fps)
 * - layered glow simulation using opacity & stroke-width modulation
 * - completely safe from formatter (string-based)
 */

export const ENERGY_BRIDGES = `
<g stroke="#FFC43D" fill="none">

    <!-- Bridge 1 -->
    <path d="M500 300 L900 650">
        <animate attributeName="stroke-width" values="2;6;2"
            dur="10s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;1;0.3"
            dur="10s" repeatCount="indefinite" />
    </path>

    <!-- Bridge 2 -->
    <path d="M900 650 L1300 950">
        <animate attributeName="stroke-width" values="2;7;2"
            dur="10s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;1;0.25"
            dur="10s" repeatCount="indefinite" />
    </path>

    <!-- Bridge 3 -->
    <path d="M1300 950 L1650 1250">
        <animate attributeName="stroke-width" values="2;8;2"
            dur="10s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;1;0.2"
            dur="10s" repeatCount="indefinite" />
    </path>

    <!-- Bridge 4 (lower matrix) -->
    <path d="M2950 1300 L3200 1350">
        <animate attributeName="stroke-width" values="3;10;3"
            dur="10s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;1;0.3"
            dur="10s" repeatCount="indefinite" />
    </path>

    <!-- Micro-energy sparks -->
    <circle cx="900" cy="650" r="4" fill="#FFC43D">
        <animate attributeName="opacity" values="0.1;1;0.1"
            dur="10s" repeatCount="indefinite" />
    </circle>

    <circle cx="1300" cy="950" r="4" fill="#FFC43D">
        <animate attributeName="opacity" values="0.2;1;0.2"
            dur="10s" repeatCount="indefinite" />
    </circle>

    <circle cx="1650" cy="1250" r="4" fill="#FFC43D">
        <animate attributeName="opacity" values="0.25;1;0.25"
            dur="10s" repeatCount="indefinite" />
    </circle>

</g>
`;