import config from "./env.config";
import { connect } from "mongoose";
import logger from "../services/logger";

const connectToDatabase = async (): Promise<void> => {
  for (let attempt = 1; attempt <= config.RETRY_LIMIT; attempt++) {
    try {
      const mongoURI = config.MONGO_URI;
      await connect(mongoURI);
      logger.info("Connected to MongoDB successfully");
      return; // Exit the function if connection is successful
    } catch (error) {
      logger.error(`Attempt ${attempt} - Error connecting to MongoDB:`, error);
      if (attempt < config.RETRY_LIMIT) {
        await new Promise((resolve) => setTimeout(resolve, config.RETRY_INTERVAL));
      } else {
        logger.error("Database connection failed. Exiting...");
        process.exit(1);
      }
    }
  }
};

export default connectToDatabase;