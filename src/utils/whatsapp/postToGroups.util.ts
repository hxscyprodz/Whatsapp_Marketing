import logger from "../../services/logger";
import { client } from "../../libs/whatsaapweb.lib";

const sendMessageToGroup = async (groupId: string, message: string) => {
    const FLAG = "SEND_MESSAGE_TO_GROUP";
    try {
        logger.info(`${FLAG} - Sending message to group ${groupId}: ${message}`);
        const chatId = `${groupId}@g.us`;
        await client.sendMessage(chatId, message);
        logger.info(`${FLAG} - Message sent successfully to group ${groupId}.`);
    } catch (error) {
        logger.error(`${FLAG} - Error sending message to group ${groupId}:`, error);
    };
};

export default sendMessageToGroup;