import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

// Check if helloWorld is not already defined
// (In a single file, just define it if not present)
export const helloWorld = onRequest((request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});
