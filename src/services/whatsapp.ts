import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import logger from "./logger";
import { getGroups, postStatus } from "../controllers/whatsapp.controller";
import { scheduleCronJob } from "./cron";

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
    logger.info("QR code received, scan it with your WhatsApp mobile app.");
    qrcode.generate(qr, { small: true });
});

client.on("ready", async() => {
    logger.info("Connection established. Client is ready!");
    scheduleCronJob("13 16 * * *", async() => {
        const message = "Good morning! This is your daily status update.";
        await postStatus(message);
    });
    /*const groups = await getGroups();
    groups?.map(group => {
        console.log(`Group Name: ${group.name}, Group ID: ${group.id._serialized}`);
    })*/

    //TODO: Implement a function to add groups to the database and associate them with the user for future reference and operations.
});

client.on("auth_failure", (message) => {
    logger.error(`Authentication failure: ${message}`);
});

client.on("message", async(message) => {
    const name = await message.getContact().then(contact => contact.pushname || contact.number);
    if(message.hasQuotedMsg) {
        const quotedMsg = await message.getQuotedMessage();
        if(quotedMsg.fromMe) {
            //TODO: Implement a function to send a notification to the user when someone replies to their message.
            logger.info(`Someone replied to your message "${quotedMsg.body}" you sent: ${message.body}`);
        } else {
            //TODO: Implement a function to determine if the message is associated with their line of business
            logger.info(`New message received from ${name} (${name}): ${message.body}`);
        }
    } else {
        //TODO: Implement a function to determine if the message is associated with their line of business
        logger.info(`New message received from ${name}: ${message.body}`);
    };
});



export default client;