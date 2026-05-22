import logger from "../../services/logger";
import { client, MessageMedia } from "../../libs/whatsaapweb.lib";

const postStatus = async (caption: string, imageUrl: string) => {
    const FLAG = "POST_STATUS";
    try {
        logger.info(`${FLAG} - Posting status: ${caption}`);
        const media = await MessageMedia.fromUrl(imageUrl);
        await client.sendMessage("status@broadcast", media, { caption });
        logger.info(`${FLAG} - Status posted successfully.`);
    } catch (error) {
        logger.error(`${FLAG} - Error posting status:`, error);
    };
};

export default postStatus;
