import client from "../services/whatsapp";
import logger from "../services/logger";

const getGroups = async () => {
    const FLAG = "FETCH_GROUPS";
    try{
        logger.info(`${FLAG} - Fetching groups...`);
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup);
        logger.info(`${FLAG} - Successfully fetched ${groups.length} groups.`);
        return groups;
    } catch(error) {
        logger.error(`${FLAG} - Error fetching groups:`, error);
    }
};

const postStatus = async (message: string) => {
    const FLAG = "POST_STATUS";
    try {
        logger.info(`${FLAG} - Posting status: ${message}`);
        await client.sendMessage("status@broadcast", message);
        logger.info(`${FLAG} - Status posted successfully.`);
    } catch (error) {
        logger.error(`${FLAG} - Error posting status:`, error);
    };
};

export {
    getGroups,
    postStatus
}
