import { client } from "../../libs/whatsaapweb.lib";
import logger from "../../services/logger";
import GroupModel from "../../models/group.model";

const getGroups = async () => {
    const FLAG = "FETCH_GROUPS";
    try{
        logger.info(`${FLAG} - Fetching groups...`);
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup);

        if(groups.length === 0) {
            logger.info(`${FLAG} - No groups found.`);
            return;
        };
        
        groups.forEach(async (group) => {
            const isExistingGroup = await GroupModel.findOne({ whatsappGroupId: group.id._serialized });
            if(!isExistingGroup) {
                const newGroup = new GroupModel({
                    whatsappGroupId: group.id._serialized,
                    name: group.name,
                });
                await newGroup.save()
                    .then(() => logger.info(`${FLAG} - Group "${group.name}" saved to database.`))
                    .catch((error) => logger.error(`${FLAG} - Error saving group "${group.name}":`, error));
            } else {
                logger.info(`${FLAG} - Group "${group.name}" already exists in the database.`);
            }
        });
        logger.info(`${FLAG} - Successfully fetched ${groups.length} groups.`);
    } catch(error) {
        logger.error(`${FLAG} - Error fetching groups:`, error);
    };
};

export default getGroups;