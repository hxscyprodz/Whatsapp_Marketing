import config from "../config/env.config";
import client from "../services/whatsapp";
import supabase from "../services/supabase.service";
import logger from "../services/logger";
import GroupModel from "../models/group.model";

const { SUPABASE_BUCKET, OWNER_ID } = config;

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
        
        groups.forEach(group => {
            const isExistingGroup = GroupModel.findOne({ id: group.id._serialized });
            if(!isExistingGroup) {
                const newGroup = new GroupModel({
                    id: group.id._serialized,
                    name: group.name,
                });
                newGroup.save()
                    .then(() => logger.info(`${FLAG} - Group "${group.name}" saved to database.`))
                    .catch((error) => logger.error(`${FLAG} - Error saving group "${group.name}":`, error));
            } else {
                logger.info(`${FLAG} - Group "${group.name}" already exists in the database.`);
            }
        });
        logger.info(`${FLAG} - Successfully fetched ${groups.length} groups.`);
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

const sendToGroupsScheduler = async (message: string) => {
    const FLAG = "SEND_TO_GROUPS_SCHEDULER";
    try {
        logger.info(`${FLAG} - Sending scheduled message to all groups: ${message}`);
        const groups = await GroupModel.find();
        for(const group of groups) {
           new Promise(async (resolve, reject) => {
                setTimeout(async () => {
                    try {
                        await sendMessageToGroup(group.id, message);
                        resolve(true);
                    } catch (error) {
                        reject(error);
                    };
                }, 10000); // Adding a delay of 10 seconds between messages to avoid rate limits
            });
        }
        logger.info(`${FLAG} - Scheduled message sent successfully to all groups.`);
    } catch (error) {
        logger.error(`${FLAG} - Error sending scheduled message to groups:`, error);
    };
};

const uploadImageToSupabase = async(message: any) => {
    const FLAG = "UPLOAD_IMAGE_TO_SUPABASE";
    try{
        const sender = await message.getContact().then((contact: any) => contact.id._serialized);
        if(sender != OWNER_ID) {
            logger.warn(`${FLAG} - Unauthorized image upload attempt by user: ${message.from}`);
            return;
        }
        
        if(message.hasMedia && message.body.toLowerCase().startsWith("!upload")) {
            await message.reply("Uploading image to Supabase...");
            // Download the media content from the message
            const cleanCaption = message.body.replace(/!upload\s*/i, '').trim();
            const media = await message.downloadMedia();
            if(!media) {
                logger.error(`${FLAG} - Failed to download media from message: ${message.id._serialized}`);
                await message.reply("Failed to download media. Please try again.");
                return;
            }

            const fileBuffer = Buffer.from(media.data, 'base64');
            const fileExtension = media.mimetype.split('/')[1] || 'jpg';
            const fileName = `uploads/${Date.now()}.${fileExtension}`;

            const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).upload(fileName, fileBuffer, {
                contentType: media.mimetype,
                upsert: true, // This option will overwrite the file if it already exists
            });

            if (error) {
                logger.error(`${FLAG} - Error uploading image to Supabase:`, error);
                await message.reply("Failed to upload image. Please try again.");
                return;
            }

           const { data: publicURLData} = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(fileName);
            const publicURL = publicURLData.publicUrl;

            logger.info(`${FLAG} - Image uploaded successfully to Supabase. Public URL: ${publicURL}`);
            await message.reply(`Image uploaded successfully.`);
        }
    } catch (error) {
        logger.error(`${FLAG} - Error uploading image to Supabase:`, error);
    }
};

export {
    getGroups,
    postStatus,
    sendMessageToGroup,
    sendToGroupsScheduler,
    uploadImageToSupabase
}
