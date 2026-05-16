import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import logger from "./logger";
import { getGroups } from "../controllers/whatsapp.controller";

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
    logger.info("QR code received, scan it with your WhatsApp mobile app.");
    qrcode.generate(qr, { small: true });
});

client.on("ready", async() => {
    logger.info("Connection established. Client is ready!");
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
    if(message.hasQuotedMsg) {
        const quotedMsg = await message.getQuotedMessage();
        if(quotedMsg.fromMe) {
            //TODO: Implement a function to send a notification to the user when someone replies to their message.
            logger.info(`Someone replied to a message you sent: ${message.body}`);
        } else {
            //TODO: Implement a function to determine if the message is associated with their line of business
            logger.info(`New message received from ${message.from}: ${message.body}`);
        }
    } else {
        //TODO: Implement a function to determine if the message is associated with their line of business
        logger.info(`New message received from ${message.from}: ${message.body}`);
    };
});



export default client;