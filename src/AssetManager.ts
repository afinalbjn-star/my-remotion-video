import { delayRender, continueRender, staticFile } from 'remotion';

const loadedFonts = new Set<string>();

// 1. Otomatisasi Registrasi Font
export const autoLoadFont = (fontName: string) => {
    if (typeof window === 'undefined' || !window.FontFace || loadedFonts.has(fontName)) {
        return;
    }

    const handle = delayRender(`Loading font: ${fontName}`);
    loadedFonts.add(fontName);

    const font = new FontFace(fontName, `url(${staticFile(`fonts/${fontName}.ttf`)})`);
    font.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        continueRender(handle);
    }).catch((e) => {
        console.error(`Failed to load font ${fontName}:`, e);
        continueRender(handle);
    });
};

// 2. Otomatisasi Pengambilan Data Koin
export const fetchCoinData = async (symbol: string) => {
    const handle = delayRender(`Fetching data for: ${symbol}`);
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`);
        const json = await response.json();
        continueRender(handle);
        return json;
    } catch (e) {
        console.error("Failed to fetch data", e);
        continueRender(handle);
        return null;
    }
};

// Fungsi simulasi untuk data Volume (Hijau)
export const fetchHistoricalVolumeData = (symbol: string, frames: number) => {
    const data = [];
    let currentVolume = 500;
    for (let i = 0; i < frames; i++) {
        // Volume cenderung memiliki spike mendadak (gerakan patah-patah)
        if (Math.random() > 0.95) {
            currentVolume = 800 + Math.random() * 400;
        } else {
            currentVolume = currentVolume * 0.9 + 100 * Math.random();
        }
        data.push({ frame: i, value: Math.max(currentVolume, 50) });
    }
    return data;
};

// Fungsi simulasi untuk data Volatilitas (Merah)
export const fetchHistoricalVolatilityData = (symbol: string, frames: number) => {
    const data = [];
    for (let i = 0; i < frames; i++) {
        // Volatilitas bergerak dengan gelombang sinusoidal + noise (gerakan mengayun)
        const base = Math.sin(i * 0.05) * 50 + 100;
        const noise = Math.random() * 20;
        data.push({ frame: i, value: base + noise });
    }
    return data;
};

// Fungsi simulasi untuk data harga historis
export const fetchHistoricalPriceData = (symbol: string, frames: number) => {
    // Ini adalah data simulasi. Dalam produksi, Anda akan mengambil data historis nyata.
    // Misalnya, dari API Binance untuk data candlestick 1 menit atau 5 menit.
    const data = [];
    let currentValue = symbol === "BTC" ? 60000 : 3000; // Harga awal simulasi
    const volatility = symbol === "BTC" ? 500 : 50; // Volatilitas simulasi

    for (let i = 0; i < frames; i++) {
        // Fluktuasi harga acak
        currentValue += (Math.random() - 0.5) * volatility;
        // Pastikan harga tidak jatuh terlalu rendah
        currentValue = Math.max(currentValue, (symbol === "BTC" ? 58000 : 2800));
        data.push({ frame: i, value: currentValue });
    }
    return data;
};

// Fungsi simulasi untuk data likuiditas (Exchange Outflow) historis
export const fetchHistoricalLiquidityData = (symbol: string, frames: number) => {
    // Ini adalah data simulasi. Dalam produksi, Anda akan mengambil data on-chain nyata.
    // Misalnya, dari Glassnode, CryptoQuant, atau API penyedia data on-chain lainnya.
    const data = [];
    let currentOutflow = symbol === "BTC" ? 1000 : 10000; // Outflow awal simulasi
    const outflowVolatility = symbol === "BTC" ? 200 : 500; // Volatilitas outflow

    for (let i = 0; i < frames; i++) {
        // Fluktuasi outflow acak
        currentOutflow += (Math.random() - 0.5) * outflowVolatility;
        // Sesekali, simulasikan "Whale Pulse" (outflow besar)
        if (i > frames * 0.6 && i < frames * 0.65) { // Contoh: lonjakan di tengah video
            currentOutflow += symbol === "BTC" ? 5000 : 20000; // Add a significant jump
        }
        // Pastikan outflow tidak negatif
        currentOutflow = Math.max(currentOutflow, (symbol === "BTC" ? 500 : 5000));
        data.push({ frame: i, value: currentOutflow, isWhalePulse: (i > frames * 0.6 && i < frames * 0.65) });
    }
    return data;
};

// 3. Otomatisasi Voiceover menggunakan TTS API (Contoh: ElevenLabs)
export const fetchVoiceover = async (text: string, apiKey: string) => {
    const handle = delayRender(`Generating voiceover for: ${text}`);
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/voice_id`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
            body: JSON.stringify({ text, model_id: "eleven_monolingual_v1" })
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        continueRender(handle);
        return url; // Gunakan URL ini di komponen <Audio src={url} />
    } catch (e) {
        console.error("TTS Generation failed", e);
        continueRender(handle);
        return null;
    }
};

// 4. Pemilihan SFX Otomatis berdasarkan pergerakan harga
export const getRelevantSFX = (priceChange: number) => {
    if (priceChange >= 2) return staticFile("audio/sfx-up.mp3");
    if (priceChange <= -2) return staticFile("audio/sfx-down.mp3");
    return null;
};

// 5. Pemilihan BGM Otomatis berdasarkan kondisi market
export const getRelevantBGM = (priceChange: number) => {
    // Jika harga turun lebih dari 5%, gunakan musik tegang
    if (priceChange < -5) return staticFile("audio/bgm-tense.mp3");
    return staticFile("audio/bgm-chill.mp3");
};