import logger from "../../services/logger";
import { client, MessageMedia } from "../../libs/whatsaapweb.lib";
import { ISendToGroupParams } from "../../types/types";

const sendMessageToGroup = async (params: ISendToGroupParams) => {
  const { groupId, message, imageUrl } = params;
  const FLAG = "SEND_MESSAGE_TO_GROUP";
  try {
    logger.info(`${FLAG} - Sending message to group ${groupId}: ${message}`);
    const media = imageUrl ? await MessageMedia.fromUrl(imageUrl) : null;
    await client.sendMessage(
      groupId,
      media ? media : message,
      media ? { caption: message } : undefined,
    );
    logger.info(`${FLAG} - Message sent successfully to group ${groupId}.`);
  } catch (error) {
    logger.error(`${FLAG} - Error sending message to group ${groupId}:`, error);
  }
};

export default sendMessageToGroup;
