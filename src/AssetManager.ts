import { delayRender, continueRender, staticFile } from 'remotion';
import { registerFont } from "@remotion/fonts";

// 1. Otomatisasi Registrasi Font
export const autoLoadFont = (fontName: string) => {
    const handle = delayRender(`Loading font: ${fontName}`);
    registerFont({
        family: fontName,
        src: staticFile(`fonts/${fontName}.ttf`),
    });
    continueRender(handle);
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