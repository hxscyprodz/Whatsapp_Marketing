import express, { Request, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import config from "./config/env.config";
import logger from "./services/logger";
import client from "./services/whatsapp";

const app = express();
const PORT = config.PORT || 3000;

app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) }}));
app.use(helmet());
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({ status: "ok", message: "Server is healthy" });
});

export const startServer = async() => {
    try{
        await client.initialize();
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error}`);
        process.exit(1);
    };
};

