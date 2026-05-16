import config from "./env.config";
import { connect } from "mongoose";
import logger from "../services/logger";

const connectToDatabase = async () => {
  try {
    const mongoURI = config.MONGO_URI;
    await connect(mongoURI);
    logger.info("Connected to MongoDB successfully");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectToDatabase;