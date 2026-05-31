/**
 * TracesB — PURE STRING VERSION (Formatter‑proof)
 * Layer B contains more complex EXTREME PCB traces:
 * - zigzag traces
 * - micro‑vias
 * - diagonal branches
 * - high‑density CPU‑die style routing
 */

export const TRACES_B = `
<g stroke="#FFC43D" stroke-width="2" fill="none" opacity="0.65">

    <!-- Zigzag micro‑routing -->
    <path d="M300 250 L350 260 L300 270 L350 280 L300 290 L380 310" />
    <path d="M500 450 L560 470 L520 490 L580 510 L540 530 L600 550" />
    <path d="M700 650 L760 670 L720 690 L780 710 L740 730 L820 760" />

    <!-- Dense diagonal branches -->
    <path d="M900 300 L1100 500 L1300 300" />
    <path d="M1000 400 L1200 600 L1400 400" />
    <path d="M1100 500 L1300 700 L1500 500" />

    <!-- Micro‑vias (short curved segments) -->
    <path d="M1600 600 Q1650 650 1700 600" />
    <path d="M1700 700 Q1750 750 1800 700" />
    <path d="M1800 800 Q1850 850 1900 800" />

    <!-- High‑density CPU core channels -->
    <path d="M2000 300 L2200 300 L2400 500 L2600 500" />
    <path d="M2000 400 L2200 400 L2400 600 L2600 600" />
    <path d="M2000 500 L2200 500 L2400 700 L2600 700" />

    <!-- Tight routing near the bottom section -->
    <path d="M2800 1200 L2900 1250 L3000 1200 L3100 1250 L3200 1200" />
    <path d="M2900 1300 L3000 1350 L3100 1300 L3200 1350 L3300 1300" />

</g>
`;