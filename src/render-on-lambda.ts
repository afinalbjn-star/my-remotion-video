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
        composition: "InstitutionalLiquidityPulse", // Updated to the correct composition ID
        inputProps: {
            coinSymbol: "BTC",
        },
        codec: "h265",
        privacy: "public",
        crf: 14,
        framesPerLambda: 30,
        downloadBehavior: {
            type: "download",
            fileName: "institutional-liquidity-pulse-4k.mp4" // Updated filename
        }
    });

    console.log(`Render started! ID: ${renderId}`);
    console.log(`Check progress at: https://${bucketName}.s3.${region}.amazonaws.com/renders/${renderId}/out.mp4`);
};

startRender();