import { createClient } from "@supabase/supabase-js";
import PostModel from "../models/post.model";
import config from "../config/env.config";
import logger from "./logger";

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);

export const uploadImageToSupabase = async (imageData: any, caption: string, postTime: string) => {
  const FLAG = "UPLOAD_IMAGE_TO_SUPABASE";
  try {
    const media = await imageData.downloadMedia();
    if (!media) {
      logger.error(
        `${FLAG} - Failed to download media from message: ${imageData.id._serialized}`,
      );
      await imageData.reply("❌ Failed to download media. Please try again.");
      return;
    }

    const fileBuffer = Buffer.from(media.data, "base64");
    const fileExtension = media.mimetype.split("/")[1] || "jpg";
    const fileName = `posts/${Date.now()}.${fileExtension}`;
    const mimeType = media.mimetype;

    await supabase.storage
      .from(config.SUPABASE_BUCKET)
      .upload(fileName, fileBuffer, {
          contentType: mimeType,
          upsert: true
      });

    const { data: publicURLData } = await supabase.storage
      .from(config.SUPABASE_BUCKET)
      .getPublicUrl(fileName);
    const publicURL = publicURLData.publicUrl;

    const newPost = {
      caption: caption,
      imageUrl: publicURL,
      scheduledTime: postTime,
    };

    return newPost;
  } catch (error) {
    logger.error(`${FLAG} - Error uploading image to Supabase:`, error);
  }
};

