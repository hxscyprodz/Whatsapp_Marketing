import supabase from "../libs/supabase.lib";
import config from "../config/env.config";
import logger from "./logger";
import { ICreatePostPayload} from "../types/types";

export const uploadImageToSupabase = async ({media, caption, postTime}: ICreatePostPayload) => {
  const FLAG = "UPLOAD_IMAGE_TO_SUPABASE";
  try {

    const fileBuffer = media.imageBuffer;
    const fileExtension = media.mimeType.split("/")[1] || "jpg";
    const fileName = `posts/${Date.now()}.${fileExtension}`;
    const mimeType = media.mimeType;

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

