import PostModel from "../../models/post.model";
import GroupModel from "../../models/group.model";
import { sendMessageToGroup, postStatus } from "../../utils/whatsapp";
import { getCurrentTime } from "../../utils/getCurrentTime";
import { format } from "../../libs/dateFns.lib";
import logger from "../logger";

const schedulePostToGroups = async () => {
  const FLAG = "SCHEDULE_POST_TO_GROUPS";
  try {
    logger.info(`${FLAG} - Fetching scheduled posts...`);
    const currentTime = getCurrentTime();
    const scheduledPosts = await PostModel.find({ scheduledTime: currentTime });

    if (scheduledPosts.length === 0) {
      logger.info(`${FLAG} - No posts scheduled for ${currentTime}.`);
      return;
    }

    const groups = await GroupModel.find();
    for (const post of scheduledPosts) {
      // Check if the post type is "post" before sending to groups
      if (post.postType === "post") {
        for (const group of groups) {
          new Promise(async (resolve, reject) => {
            setTimeout(async () => {
              try {
                await sendMessageToGroup({
                  groupId: group.whatsappGroupId,
                  message: post.caption,
                  imageUrl: post.imageUrl || "",
                });
                resolve(true);
              } catch (error) {
                reject(error);
              }
            }, 10000); // Adding a delay of 10 seconds between messages to avoid rate limits
          });
        }
      }
    }
    logger.info(`${FLAG} - Scheduled posts sent successfully to all groups.`);
  } catch (error) {
    logger.error(`${FLAG} - Error sending scheduled posts to groups:`, error);
  }
};

const scheduledStatusUpdate = async () => {
  const FLAG = "SCHEDULED_STATUS_UPDATE";
  const now = new Date();
  const time = format(now, "HH:mm");
  try {
    const currentTime = time;
    const post = await PostModel.findOne({ scheduledTime: time });
    if (!post) {
      logger.info(
        `${FLAG} - No post found for the scheduled time: ${time}. Current time is ${currentTime}.`,
      );
      return;
    }

    //check if the post type is story before posting status
    if (post.postType === "story") {
      await postStatus(post.caption, post.imageUrl || "");
      logger.info(`${FLAG} - Status updated successfully.`);
    }
  } catch (error) {
    logger.error(`${FLAG} - Error updating status:`, error);
  }
};

export { schedulePostToGroups, scheduledStatusUpdate };
