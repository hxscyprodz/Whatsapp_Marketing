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

export {
    getGroups,
}
