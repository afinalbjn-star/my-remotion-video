/**
 * NodesPulse — PURE STRING VERSION (Formatter‑proof)
 * Animated pulse nodes for EXTREME PCB:
 * - Uses SVG <animate> for opacity pulsing
 * - 100% seamless loop (dur="10s", matching 600 frames at 60fps)
 * - Gold (#FFC43D) glowing energy points
 * - Layer is injected as raw string to avoid formatter corruption
 */

export const NODES_PULSE = `
<g fill="#FFC43D">

    <!-- Pulsing nodes (seamless loop) -->
    <circle cx="600" cy="350" r="14">
        <animate attributeName="opacity" values="0.2;1;0.2"
            dur="10s" repeatCount="indefinite" />
    </circle>

    <circle cx="900" cy="650" r="14">
        <animate attributeName="opacity" values="0.15;1;0.15"
            dur="10s" repeatCount="indefinite" />
    </circle>

    <circle cx="1200" cy="950" r="14">
        <animate attributeName="opacity" values="0.1;1;0.1"
            dur="10s" repeatCount="indefinite" />
    </circle>

    <circle cx="1500" cy="1250" r="14">
        <animate attributeName="opacity" values="0.2;1;0.2"
            dur="10s" repeatCount="indefinite" />
    </circle>

    <circle cx="1800" cy="1550" r="14">
        <animate attributeName="opacity" values="0.25;1;0.25"
            dur="10s" repeatCount="indefinite" />
    </circle>

    <!-- Energy micro‑pulse dots -->
    <circle cx="2100" cy="400" r="8">
        <animate attributeName="opacity" values="0.15;1;0.15"
            dur="10s" repeatCount="indefinite" />
    </circle>

    <circle cx="2250" cy="500" r="8">
        <animate attributeName="opacity" values="0.1;1;0.1"
            dur="10s" repeatCount="indefinite" />
    </circle>

    <circle cx="2400" cy="600" r="8">
        <animate attributeName="opacity" values="0.18;1;0.18"
            dur="10s" repeatCount="indefinite" />
    </circle>

    <!-- Lower section pulsers -->
    <circle cx="2950" cy="1300" r="16">
        <animate attributeName="opacity" values="0.25;1;0.25"
            dur="10s" repeatCount="indefinite" />
    </circle>

    <circle cx="3200" cy="1350" r="16">
        <animate attributeName="opacity" values="0.2;1;0.2"
            dur="10s" repeatCount="indefinite" />
    </circle>

</g>
`;