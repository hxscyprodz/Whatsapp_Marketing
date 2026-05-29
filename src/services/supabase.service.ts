import supabase from "../libs/supabase.lib";
import config from "../config/env.config";
import logger from "./logger";
import { ICreatePostPayload } from "../types/types";

export const uploadImageToSupabase = async ({
  media,
  caption,
  postTime,
}: ICreatePostPayload) => {
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
        upsert: true,
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

export const deleteImageFromSupabase = async (imageUrl: string) => {
  const FLAG = "DELETE_IMAGE_FROM_SUPABASE";
  try {
    const bucketToken = `/${config.SUPABASE_BUCKET}/`;
    const parts = imageUrl.split(bucketToken);

    if (parts.length < 2) {
      throw new Error("Bucket name not found.");
    }

    const fileName = parts[1];
    const { data } = await supabase.storage
      .from(config.SUPABASE_BUCKET)
      .remove([fileName || ""]);

    if (!data || data.length <= 0) {
      throw new Error("Failed to delete image.");
    }

    logger.info(`${FLAG} - Image removed successfully.`);
    return data;
  } catch (error: any) {
    logger.error(`${FLAG} - Removing image from DB failed: ${error}`);
    throw new Error(error?.message);
  }
};
