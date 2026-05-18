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

    // 2. Trigger render untuk komposisi 'BusinessStats'
    const { renderId, bucketName } = await renderMediaOnLambda({
        region,
        functionName,
        serveUrl,
        composition: "BusinessStats",
        inputProps: {
            coinSymbol: "BTC",
            theme: "dark",
            showLottie: true
        },
        codec: "h264",
        privacy: "public",
    });

    console.log(`Render started! ID: ${renderId}`);
    console.log(`Check progress at: https://${bucketName}.s3.${region}.amazonaws.com/renders/${renderId}/out.mp4`);
};

startRender();