import PostModel from "../../models/post.model";
import GroupModel from "../../models/group.model";
import { sendMessageToGroup, postStatus } from "../../utils/whatsapp";
import { PostType } from "../../types/types";
import { format } from "../../libs/dateFns.lib";
import logger from "../logger";
import shuffle from "lodash.shuffle";

const schedulePostToGroups = async () => {
  const FLAG = "SCHEDULE_POST_TO_GROUPS";
  try {
    logger.info(`${FLAG} - Fetching scheduled posts...`);
    const post = await PostModel.findOne({ posted: false, postType: PostType.POST });
    if(post) {
      const unshuffledGroups = await GroupModel.find({}, { whatsappGroupId: 1 });
      const shuffledGroups = shuffle(unshuffledGroups);
      const groups = Math.ceil(shuffledGroups.length / 2) > 0 ? shuffledGroups.slice(0, Math.ceil(shuffledGroups.length / 2)) : shuffledGroups;

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
      post.posted = true;
      await post.save();
      logger.info(`${FLAG} - Scheduled posts sent successfully to all groups.`);
    } else {
      logger.warn(`${FLAG} - All posts have been sent. Resetting posted status for all posts...`);
      await PostModel.updateMany({ posted: true }, { posted: false });
      schedulePostToGroups(); // Restart the scheduling process after resetting the posted status
      logger.info(`${FLAG} - Posted status reset successfully for all posts.`);
    }
  } catch (error) {
    logger.error(`${FLAG} - Error sending scheduled posts to groups:`, error);
  }
};

const scheduledStatusUpdate = async () => {
  const FLAG = "SCHEDULED_STATUS_UPDATE";
  const now = new Date();
  const time = format(now, "HH:mm");
  const postTimes = ["09:00", "12:00", "15:00", "18:00", "21:00", "22:40"]; // Define the times at which you want to post status updates
  try {
    const currentTime = time;
    const post = await PostModel.findOne({ posted: false, postType: PostType.STORY });
    if (!post) {
      logger.info(
        `${FLAG} - No post found for the scheduled time: ${time}. Current time is ${currentTime}.`,
      );
      return;
    }

    if(postTimes.includes(currentTime)) {
      await postStatus(post.caption, post.imageUrl || "");
      logger.info(`${FLAG} - Status updated successfully.`);
    }
  } catch (error) {
    logger.error(`${FLAG} - Error updating status:`, error);
  }
};

export { schedulePostToGroups, scheduledStatusUpdate };
