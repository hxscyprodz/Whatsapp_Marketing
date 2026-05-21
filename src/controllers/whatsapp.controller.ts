import config from "../config/env.config";
import client from "../services/whatsapp";
import { MessageMedia } from "whatsapp-web.js";
import { uploadImageToSupabase } from "../services/supabase.service"
import logger from "../services/logger";
import GroupModel from "../models/group.model";
import PostModel from "../models/post.model";
import { validateTimeFormat, formatCaptionAndTime } from "../utils/utils";
import { format } from "date-fns";
import { IPost } from "../types/types";

const { OWNER_ID } = config;

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

const postStatus = async (caption: string, imageUrl: string) => {
    const FLAG = "POST_STATUS";
    try {
        logger.info(`${FLAG} - Posting status: ${caption}`);
        const media = await MessageMedia.fromUrl(imageUrl);
        await client.sendMessage("status@broadcast", media, { caption });
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

export const processImageUpload = async(message: any) => {
    const FLAG = "UPLOAD_IMAGE_TO_SUPABASE";
    try{
        const senderId = await message.getContact().then((contact: any) => contact.id._serialized);
        
        if(message.hasMedia && message.body.toLowerCase().startsWith("!upload")) {
            if(senderId !== OWNER_ID) {
                logger.warn(`${FLAG} - Unauthorized image upload attempt by user: ${message.from}`);
                await message.reply("❌ *You are not authorized to upload assets to this system.*");
                return;
            };

            await message.reply("Uploading image to image bucket...");

            //Extracting caption and post time from the message
            const { caption, postTime, timeMatch } = await formatCaptionAndTime(message);

            //Validating post time format and providing feedback if it's incorrect
            const isValidTime = validateTimeFormat(postTime);
            if (!isValidTime && timeMatch) {
                await message.reply("⚠️ Warning: Post time format seems off. Please use 'HH:MM' (e.g., \"17:00\"). Defaulting to \"12:00\".");
            };

            //Uploading image to Supabase and saving post details to Database
            const newPost = await uploadImageToSupabase(message, caption, postTime);
            if(newPost) {
                await PostModel.create(newPost);
                logger.info(`${FLAG} - Image uploaded successfully to Database.`);
                await message.reply(`✅ Post uploaded successfully.`);
            } else {
                logger.error(`${FLAG} - Failed to upload image to Database.`);
                await message.reply(`❌ Failed to upload image. Please try again.`);
            };
        };
    } catch (error) {
        logger.error(`${FLAG} - Error uploading image to Database:`, error);
    };
};

const scheduledStatusUpdate = async() => {
    const FLAG = "SCHEDULED_STATUS_UPDATE";
    const now = new Date();
    const time = format(now, "HH:mm");
    try {
        const currentTime = time;
        const post = await PostModel.findOne({ scheduledTime: time });
        if(!post) {
            logger.info(`${FLAG} - No post found for the scheduled time: ${time}. Current time is ${currentTime}.`);
            return;
        };
        await postStatus(post.caption, post.imageUrl);
        logger.info(`${FLAG} - Status updated successfully.`);
    } catch (error) {
        logger.error(`${FLAG} - Error updating status:`, error);
    };
};

export {
    getGroups,
    postStatus,
    sendMessageToGroup,
    sendToGroupsScheduler,
    uploadImageToSupabase,
    scheduledStatusUpdate,
}
