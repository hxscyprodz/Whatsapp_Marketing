import path from "path";
import dotenv from "dotenv";
import logger from "../services/logger";

dotenv.config({ path: path.join(__dirname, '../../.env')});

const mandatoryVariables = [
    "PORT",
    "APP_ENV",
    "MONGODB_URI",
];

const missingVariables = mandatoryVariables.filter((variable) => !process.env[variable]);

if(missingVariables.length > 0) {
    const variableString = JSON.stringify(missingVariables);
    logger.error(`Environment variable(s) ${variableString.substring(1, variableString.length - 1)} are required to start the server.
    
    If running on local machine create a .env file in your route directory and define them there.
    `);

    process.exit(1);
    
};


const config = {
    PORT: process.env.PORT || 5000,
    APP_ENV: process.env.APP_ENV || "development",
    MONGO_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/whatsapp_marketing",
};

export default config;