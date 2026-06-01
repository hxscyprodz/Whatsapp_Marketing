import logger from "../logger";
import { EMessageSentFrom } from "../../types/types"; 
import notificationBuilder from "../../utils/whatsapp/notificationBuilder";

export const handleTextMessage = async(message: any, from: EMessageSentFrom) => {
    if(from === EMessageSentFrom.DIRECT) {
        logger.info(`Received direct text message: ${message.body} : from ${message.from}`);
        await notificationBuilder(message);
    }else {
        logger.info(`Received group text message: ${message.body} : from ${message.from}`);
        await notificationBuilder(message);
    };
};

export const handleImageMessage = async(message: any, from: EMessageSentFrom) => {
    if(from === EMessageSentFrom.DIRECT) {
        logger.info(`Received direct image message with caption: ${message.caption} : from ${message.from}`);
        await notificationBuilder(message);
    }else {
        logger.info(`Received group image message with caption: ${message.caption} : from ${message.from}`);
        await notificationBuilder(message);
    };
};

export const handleAudioMessage = async(message: any, from: EMessageSentFrom) => {
    if(from === EMessageSentFrom.DIRECT) {
        logger.info(`Received direct audio message : from ${message.from}`);
        await notificationBuilder(message);
    }else {
        logger.info(`Received group audio message : from ${message.from}`);
        await notificationBuilder(message);
    };
};