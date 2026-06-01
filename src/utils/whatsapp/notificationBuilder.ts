import { MessageTypes } from 'whatsapp-web.js';
import { client } from "../../libs/whatsaapweb.lib";

async function buildAdminNotification(message: any) {
    const chat = await message.getChat();
    const contact = await message.getContact();
    
    // 1. Determine the source context (Group vs Private)
    let sourceContext = "";
    if (chat.isGroup) {
        sourceContext = `👥 *Group:* ${chat.name}\n👤 *Sender:* ${contact.id.user} `;
    } else {
        sourceContext = `📱 *Private Chat*\n👤 *From:* ${contact.id.user}`;
    }


    const isStatusReply = message.hasQuotedMsg && message._data?.quotedMsg?.id?.fromMe === true && message._data?.quotedMsg?.id?.remote === 'status@broadcast';
    if (isStatusReply) {
        sourceContext += `\n🎯 *Context:* Replied to your Status Update`;
    }

    let contentDetails = "";
    
    switch (message.type) {
        case MessageTypes.TEXT:
            contentDetails = `💬 *Message:* \n"${message.body}"`;
            break;

        case MessageTypes.AUDIO:
        case MessageTypes.VOICE:
            contentDetails = `🎵 *Message Type:* Audio/Voice Message`;
            break;

        case MessageTypes.IMAGE:
            const captionText = message.body ? `\n🏷️ *Caption:* "${message.body}"` : "\n🏷️ *Caption:* _None_";
            contentDetails = `🖼️ *Message Type:* Image Message${captionText}`;
            break;

        default:
            contentDetails = `❓ *Message Type:* Unhandled file type (${message.type})`;
            break;
    }

    const notificationTemplate = 
`*[NEW ALERT]*
----------------------------------
${sourceContext}
${contentDetails}
----------------------------------
⏱️ _Received at: ${new Date().toLocaleTimeString()}_`;

    await client.sendMessage('263782105799@c.us', notificationTemplate);
}

export default buildAdminNotification;