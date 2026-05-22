import logger from "../../services/logger";
import config from "../../config/env.config";
import { uploadImageToSupabase } from "../../services/supabase.service";
import PostModel from "../../models/post.model";
import { validateTimeFormat, formatCaptionAndTime } from "../utils"

export const processImageUpload = async(message: any) => {
    const FLAG = "UPLOAD_IMAGE_TO_SUPABASE";
    try{
        const senderId = await message.getContact().then((contact: any) => contact.id._serialized);
        
        if(message.hasMedia && message.body.toLowerCase().startsWith("!upload")) {
            if(senderId !== config.OWNER_ID) {
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