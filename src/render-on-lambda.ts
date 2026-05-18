import "dotenv/config";
import { renderMediaOnLambda, deploySite } from "@remotion/lambda";
import path from "path";

const region = "us-east-1";
const functionName = "remotion-render-4-0-0"; // Sesuaikan dengan versi Anda

const startRender = async () => {
    // 1. Deploy site secara otomatis jika ada perubahan
    const { serveUrl } = await deploySite({
        entryPoint: path.join(process.cwd(), "src/index.ts"),
        bucketName: "my-remotion-bucket",
        region,
    });

    // 2. Trigger render for composition 'InstitutionalLiquidityPulse'
    const { renderId, bucketName } = await renderMediaOnLambda({
        region,
        functionName,
        serveUrl,
        composition: "CyberIntelligenceGrid", // Mengubah komposisi yang akan dirender ke CyberIntelligenceGrid
        // Jika Anda ingin merender komposisi lain, ganti "CyberIntelligenceGrid" dengan ID komposisi yang diinginkan.
        // Contoh: composition: "InstitutionalLiquidityPulse",
        // inputProps: { coinSymbol: "BTC" }, // Hapus atau sesuaikan inputProps jika komposisi tidak memerlukannya
        codec: "h265",
        privacy: "public",
        videoBitrate: "100M", // Ditingkatkan untuk memaksa ukuran file lebih besar
        framesPerLambda: 60, // Meningkatkan framesPerLambda untuk potensi render lebih cepat
        downloadBehavior: {
            type: "download",
            fileName: "cyber-intelligence-grid-4k-50mbps.mp4" // Menyesuaikan nama file dengan komposisi
        }
    });

    console.log(`Render started! ID: ${renderId}`);
    console.log(`Check progress at: https://${bucketName}.s3.${region}.amazonaws.com/renders/${renderId}/out.mp4`);
};

startRender();