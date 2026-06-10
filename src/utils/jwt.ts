import jwt from "jsonwebtoken";
import config from "../config/env.config";
import { IJWTPayload } from "../types/types";

const secret = config.ACCESS_SECRET_KEY || "whatsapp_marketing_access";

const generateAccessToken = (payload: IJWTPayload) => {
    return jwt.sign(payload, secret, { expiresIn: "15m"});
};

const verifyAccessToken = async(token: string) => {
    return jwt.verify(token ,secret);
};

export {
    generateAccessToken,
    verifyAccessToken,
}