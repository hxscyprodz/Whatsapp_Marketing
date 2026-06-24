import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import logger from "../services/logger";

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-web-security",
            "--disable-extensions",
        ],
        executablePath: '/usr/bin/google-chrome',
        timeout: 60000,
    },
});

const hanldeShutdown = async(signal: string) => {
    logger.warn(`Received ${signal}. Shutting down...`);
    try{
        await client.destroy();
        logger.warn('Client destroyed');
        process.exit(0);
    } catch(error: any) {
        logger.error(`Error shutting down: ${error.message}`)
    }
}

process.on('SIGINT', () => hanldeShutdown('SIGINT'));
process.on('SIGTERM', () => hanldeShutdown('SIGTERM'));

process.once('SIGUSR2', async() =>  {
    logger.warn('Nodemon restart signal received. Restarting...');
    try{
        await client.destroy();
    } catch{}
    process.kill(process.pid, 'SIGUSR2');
})

export {
    client,
    MessageMedia,
};