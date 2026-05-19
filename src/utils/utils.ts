export const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
};

export const formatCaptionAndTime = async(message: any) => {
    const captionRegex = /Caption:\s*"([^"]+)"/i;
    const timeRegex = /Post time:\s*"([^"]+)"/i;

    const messageText = message.body;
    const captionMatch = messageText.match(captionRegex);
    const timeMatch = messageText.match(timeRegex);

    // Extract values, or apply safe defaults if regex fails to match them
    const caption = captionMatch ? captionMatch[1].trim() : "No caption provided";
    const postTime = timeMatch ? timeMatch[1].trim() : "12:00";

    return { caption, postTime, timeMatch };
}