import { client } from "../libs/whatsaapweb.lib";
import qrcode from "qrcode-terminal";
import logger from "./logger";
//import { processImageUpload } from "../controllers/whatsapp.controller";
import { getGroups } from "../utils/whatsapp";
import { runCronJobs } from "./cron";
import { IAppState } from "../types/types";
import incomingMessagesHandler from "./whatsapp/incomingMessagesHandler";

client.on("qr", (qr) => {
    logger.info("QR code received, scan it with your WhatsApp mobile app.");
    qrcode.generate(qr, { small: true });
});

const appState: IAppState = {
    isClientReady: false,
    isCronRunning: false
};

client.on("ready", async() => {
    logger.info("Connection established. Client is ready!");
    appState.isClientReady = true;
    await getGroups();
});

//cron jobs
runCronJobs(appState);


client.on("disconnected", (reason) => {
    logger.warn(`Client disconnected: ${reason}`);
    process.exit(1);
});

client.on("auth_failure", (message) => {
    logger.error(`Authentication failure: ${message}`);
});

client.on("message", async(message) => {
    const id = await message.getContact().then(contact => contact.id._serialized);
    await incomingMessagesHandler(message);
});

export default client;