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
    const postTimes = ["06:00", "07:00", "08:00", "00:00"];
    const time = format(new Date(), "HH:mm");

    if (!postTimes.includes(time)) return;

    const post = await PostModel.findOne({
      posted: false,
      postType: PostType.POST,
    });

    if (post) {
      const unshuffledGroups = await GroupModel.find({}, { whatsappGroupId: 1 });
      const shuffledGroups = shuffle(unshuffledGroups);
      const groups = shuffledGroups.slice(0, Math.ceil(shuffledGroups.length / 2));

      for (const group of groups) {
        await sendMessageToGroup({
          groupId: group.whatsappGroupId,
          message: post.caption,
          imageUrl: post.imageUrl || "",
        });
        // Sequential rate limiting: wait 10 seconds before sending to the next group
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      post.posted = true;
      await post.save();
      logger.info(`${FLAG} - Scheduled posts sent successfully to all groups.`);
    } else {
      const postCount = await PostModel.countDocuments({
        postType: PostType.POST,
      });

      if (postCount > 0) {
        logger.warn(
          `${FLAG} - All group posts have been sent. Resetting posted status for group posts...`,
        );
        await PostModel.updateMany(
          { postType: PostType.POST, posted: true },
          { posted: false },
        );
        return schedulePostToGroups();
      } else {
        logger.info(`${FLAG} - No group posts found in the database.`);
      }
    }
  } catch (error) {
    logger.error(`${FLAG} - Error sending scheduled posts to groups:`, error);
  }
};

const scheduledStatusUpdate = async () => {
  const FLAG = "SCHEDULED_STATUS_UPDATE";
  try {
    const postTimes = ["09:00", "12:00", "15:00", "18:00", "21:40", "22:40"];
    const currentTime = format(new Date(), "HH:mm");

    if (!postTimes.includes(currentTime)) return;

    const post = await PostModel.findOne({
      posted: false,
      postType: PostType.STORY,
    });

    if (post) {
      await postStatus(post.caption, post.imageUrl || "");
      post.posted = true;
      await post.save();
      logger.info(`${FLAG} - Status updated successfully.`);
    } else {
      const storyCount = await PostModel.countDocuments({
        postType: PostType.STORY,
      });

      if (storyCount > 0) {
        logger.warn(
          `${FLAG} - All story posts have been sent. Resetting posted status for story posts...`,
        );
        await PostModel.updateMany(
          { postType: PostType.STORY, posted: true },
          { posted: false },
        );
        return scheduledStatusUpdate();
      } else {
        logger.info(`${FLAG} - No story posts found in the database.`);
        return;
      }
    }
  } catch (error) {
    logger.error(`${FLAG} - Error updating status:`, error);
  }
};

export { schedulePostToGroups, scheduledStatusUpdate };
