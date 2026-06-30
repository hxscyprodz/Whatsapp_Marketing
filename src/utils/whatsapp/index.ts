import { client, MessageMedia } from "../../libs/whatsaapweb.lib";
import { ISendMessageParams } from "../../types/types";
import logger from "../../services/logger";
import GroupModel from "../../models/group.model";
import { delay } from "../randomTypingBreak";

export const getGroups = async () => {
  const FLAG = "FETCH_GROUPS";
  try {
    logger.info(`${FLAG} - Fetching groups...`);
    const chats = await client.getChats();
    const groups = chats.filter((chat) => chat.isGroup);

    if (groups.length === 0) {
      logger.info(`${FLAG} - No groups found.`);
      return;
    }

    groups.forEach(async (group) => {
      const isExistingGroup = await GroupModel.findOne({
        whatsappGroupId: group.id._serialized,
      });
      if (!isExistingGroup) {
        const newGroup = new GroupModel({
          whatsappGroupId: group.id._serialized,
          name: group.name,
        });
        await newGroup
          .save()
          .then(() =>
            logger.info(`${FLAG} - Group "${group.name}" saved to database.`),
          )
          .catch((error) =>
            logger.error(
              `${FLAG} - Error saving group "${group.name}":`,
              error,
            ),
          );
      }
    });
    logger.info(`${FLAG} - Successfully fetched ${groups.length} groups.`);
  } catch (error) {
    logger.error(`${FLAG} - Error fetching groups:`, error);
  }
};

export const postStatus = async (caption: string, imageUrl: string) => {
  const FLAG = "POST_STATUS";
  try {
    logger.info(`${FLAG} - Posting status: ${caption}`);
    const media = await MessageMedia.fromUrl(imageUrl);
    await client.sendMessage("status@broadcast", media, { caption });
    logger.info(`${FLAG} - Status posted successfully.`);
  } catch (error) {
    logger.error(`${FLAG} - Error posting status:`, error);
  }
};


export const sendMessage = async (params: ISendMessageParams) => {
  const { contactId, groupId, message, imageUrl, to } = params;
  const id = (to === "group" ? groupId : contactId) || "";
  const chat = await client.getChatById(id);
  const FLAG = `SEND_MESSAGE_TO_${to.toUpperCase()}`;
  try {
    logger.info(`${FLAG} - Sending message to ${to} ${id}: ${message}`);
    const media = imageUrl ? await MessageMedia.fromUrl(imageUrl) : null;
    //imitate the typing status
    await chat.sendStateTyping();
    await delay({ message, min: 5000, max: 7000 });
    await client.sendMessage(
      id,
      media ? media : message,
      media ? { caption: message } : undefined,
    );
    await chat.clearState();
    logger.info(`${FLAG} - Message sent successfully to ${to} ${id}.`);
  } catch (error) {
    logger.error(`${FLAG} - Error sending message to ${to} ${id}:`, error);
  }
};
