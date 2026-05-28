import cron from "node-cron";
import logger from "./logger";
import config from "../config/env.config";
import { scheduledStatusUpdate } from "../controllers/whatsapp.controller";
import { getGroups } from "../utils/whatsapp";
import schedulePostToGroups from "./whatsapp/schedulePost";
import { IAppState } from "../types/types";

const FLAG = "CRON_JOB";
export const scheduleCronJob = (cronExpression: string, task: () => void) => {
  try {
    cron.schedule(cronExpression, task);
  } catch (error) {
    logger.error(`${FLAG} - Failed to schedule cron job: ${error}`);
  }
};

export const runCronJobs = async (state: IAppState) => {
  scheduleCronJob(config.CRON_SCHEDULE_INTERVAL, async (): Promise<void> => {
    if (state.isCronRunning) {
      logger.warn("Cron job is already running. Skipping this execution.");
      return;
    }

    if (!state.isClientReady) {
      logger.warn("Client is not ready. Skipping scheduled tasks.");
      return;
    }

    state.isCronRunning = true;

    try {
      logger.info("Executing scheduled tasks...");

      await schedulePostToGroups();
      await scheduledStatusUpdate();
      await getGroups();
    } catch (error) {
      logger.error("Error executing scheduled tasks:", error);
    } finally {
      state.isCronRunning = false;
    }
  });
};
