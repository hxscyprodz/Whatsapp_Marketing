import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";

const client = new Client({
    authStrategy: new LocalAuth(),
});

export {
    client,
    MessageMedia,
};