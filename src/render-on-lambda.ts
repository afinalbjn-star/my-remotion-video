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

    // 2. Trigger render for composition 'CorporateGrowth-Seamless'
    const { renderId, bucketName } = await renderMediaOnLambda({
        region,
        functionName,
        serveUrl,
        composition: "CorporateGrowth-Seamless",
        inputProps: {
            coinSymbol: "BTC",
            theme: "dark",
            showLottie: true
        },
        codec: "h265", // H.265 jauh lebih tajam untuk resolusi 4K dibanding H.264
        privacy: "public",
        crf: 14, // CRF 14 memberikan kualitas visual yang hampir lossless tanpa membuat file terlalu raksasa
        framesPerLambda: 30, // Membagi tugas lebih kecil agar render jauh lebih cepat
        downloadBehavior: {
            type: "download",
            fileName: "render-4k-terbaik.mp4"
        }
    });

    console.log(`Render started! ID: ${renderId}`);
    console.log(`Check progress at: https://${bucketName}.s3.${region}.amazonaws.com/renders/${renderId}/out.mp4`);
};

startRender();