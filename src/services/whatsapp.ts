import { client } from "../libs/whatsaapweb.lib";
import config from "../config/env.config";
import qrcode from "qrcode-terminal";
import logger from "./logger";
import { processImageUpload, scheduledStatusUpdate } from "../controllers/whatsapp.controller";
import { getGroups } from "../utils/whatsapp";
import { runCronJobs } from "./cron";
import { IAppState } from "../types/types";

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
    await processImageUpload(message);
    if(message.hasQuotedMsg) {
        const quotedMsg = await message.getQuotedMessage();
        if(quotedMsg.fromMe) {
            //TODO: Implement a function to send a notification to the user when someone replies to their message.
            logger.info(`Someone replied to your message "${quotedMsg.body}" you sent: ${message.body}`);
        } else {
            //TODO: Implement a function to determine if the message is associated with their line of business
            logger.info(`New message received from ${id}: ${message.body}`);
        }
    } else {
        //TODO: Implement a function to determine if the message is associated with their line of business
        logger.info(`New message received from ${id}: ${message.body}`);
    };
});

export default client;