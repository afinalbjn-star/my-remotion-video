/**
 * NodesA — PURE STRING VERSION (Formatter‑proof)
 * Static gold CPU‑die nodes:
 * - square pads
 * - circular via‑points
 * - uniform golden color (#FFC43D)
 * - used as base nodes before pulse animation layers
 */

export const NODES_A = `
<g fill="#FFC43D" opacity="0.9">

    <!-- CPU Core Pads (square nodes) -->
    <rect x="450" y="260" width="22" height="22" rx="4" />
    <rect x="750" y="560" width="22" height="22" rx="4" />
    <rect x="1050" y="860" width="22" height="22" rx="4" />
    <rect x="1350" y="1160" width="22" height="22" rx="4" />
    <rect x="1650" y="1460" width="22" height="22" rx="4" />

    <!-- Circular micro‑nodes -->
    <circle cx="600" cy="400" r="10" />
    <circle cx="900" cy="700" r="10" />
    <circle cx="1200" cy="1000" r="10" />
    <circle cx="1500" cy="1300" r="10" />
    <circle cx="1800" cy="1600" r="10" />

    <!-- High‑density CPU grid (small dots) -->
    <circle cx="2100" cy="350" r="6" />
    <circle cx="2250" cy="450" r="6" />
    <circle cx="2400" cy="550" r="6" />
    <circle cx="2550" cy="650" r="6" />
    <circle cx="2700" cy="750" r="6" />

    <circle cx="2100" cy="450" r="6" />
    <circle cx="2250" cy="550" r="6" />
    <circle cx="2400" cy="650" r="6" />
    <circle cx="2550" cy="750" r="6" />
    <circle cx="2700" cy="850" r="6" />

    <!-- Lower matrix nodes -->
    <circle cx="2950" cy="1250" r="12" />
    <circle cx="3100" cy="1350" r="12" />
    <circle cx="3250" cy="1250" r="12" />
    <circle cx="3400" cy="1350" r="12" />

</g>
`;