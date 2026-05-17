import cron from "node-cron";
import logger from "./logger";

const FLAG = "CRON_JOB"
export const scheduleCronJob = (cronExpression: string, task: () => void) => {
    try {
        cron.schedule(cronExpression, task);
    } catch (error) {
        logger.error(`${FLAG} - Failed to schedule cron job: ${error}`);
    };
};