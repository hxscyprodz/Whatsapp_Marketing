import PostModel from "../../models/post.model";
import GroupModel from "../../models/group.model";
import { sendMessageToGroup } from "../../utils/whatsapp";
import getCurrentTime from "../../utils/getCurrentTime";
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
      for (const group of groups) {
        new Promise(async (resolve, reject) => {
          setTimeout(async () => {
            try {
              await sendMessageToGroup({
                groupId: group.whatsappGroupId,
                message: post.caption,
                imageUrl: post.imageUrl,
              });
              resolve(true);
            } catch (error) {
              reject(error);
            }
          }, 10000); // Adding a delay of 10 seconds between messages to avoid rate limits
        });
      }
    }
    logger.info(`${FLAG} - Scheduled posts sent successfully to all groups.`);
  } catch (error) {
    logger.error(`${FLAG} - Error sending scheduled posts to groups:`, error);
  }
};

export default schedulePostToGroups;
