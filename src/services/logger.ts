import { createLogger, format, transports } from "winston";
import config from "../config/env.config";
import DailyRotateFile from "winston-daily-rotate-file";
import fs from "fs";
import path from "path";
const { printf, combine, json, colorize, timestamp } = format;

const logDir = path.join(__dirname, '../../src/logs');
const currentEnvironment = config?.APP_ENV || "development";

if (currentEnvironment === 'production' && !fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
};

const loggerFormat = printf(({ timestamp, level, message}) => {
    return `${timestamp} [ ${level} ] : ${message}`;
});

const logger = createLogger({
    level: currentEnvironment === "development" ? "debug" : "info",
    format: combine(timestamp(), currentEnvironment === "development" ? combine(colorize(), loggerFormat) : json()),
    transports: [ new transports.Console() ] 
});

if(currentEnvironment === "production") {
    logger.add(new DailyRotateFile({
        filename: path.join(logDir, 'combined-%DATE%.log'),
        datePattern: "YYYY-MM-DD",
        maxFiles: "14d",
    }));

    logger.add(new DailyRotateFile({
        level: "error",
        filename: path.join(logDir, 'errors-%DATE%.log'),
        datePattern: "YYYY-MM-DD",
        maxFiles: "14d",
    }));
};



export default logger;