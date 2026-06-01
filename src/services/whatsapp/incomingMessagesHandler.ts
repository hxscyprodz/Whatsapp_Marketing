import logger from "../logger";
import { MessageTypes } from "whatsapp-web.js";
import { handleTextMessage, handleImageMessage, handleAudioMessage } from "./messageHandlers";
import { EMessageSentFrom } from "../../types/types";

const incomingMessagesHandler = async (message: any) => {
  const FLAG = "INCOMING_MESSAGES_HANDLER";
  try {
    const chat = await message.getChat();
    const isGroup = chat.isGroup;

    if(message.from === 'status@broadcast') return;

    switch (message.type) {
        case MessageTypes.TEXT:
            await handleTextMessage(message, isGroup ? EMessageSentFrom.GROUP : EMessageSentFrom.DIRECT);
            break;
        case MessageTypes.IMAGE:
            await handleImageMessage(message, isGroup ? EMessageSentFrom.GROUP : EMessageSentFrom.DIRECT);
            break;
        case MessageTypes.AUDIO:
            await handleAudioMessage(message, isGroup ? EMessageSentFrom.GROUP : EMessageSentFrom.DIRECT);
            break;
    }
  } catch (error) {
    logger.error(`${FLAG} - Error handling incoming message:`, error);
  }
};

export default incomingMessagesHandler;
