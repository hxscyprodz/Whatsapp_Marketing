import { Request, Response } from "express";
import Client from "../models/client.model";
import { IClientRegister } from "../types/types";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { generateAccessToken } from "../utils/jwt";
import { StatusCodes } from "http-status-codes";

export const clientLogin = async(req: Request, res: Response) => {
    try{
        const { phoneNumber, password } = req.body;
        if(!phoneNumber || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Username or password not provided",
                data: {},
                error: {
                    name: "AUTH_ERROR",
                    message: "Required fields are missing"
                }
            });
        }

        const client = await Client.findOne({ phoneNumber });
        if(!client) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Invalid credentials",
                data: {},
                error: {
                    name: "AUTH_ERROR",
                    message: "User account does not match any user records"
                }
            });
        }

        const isPasswordValid = await comparePassword(password, client?.password);
        if(!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Invalid credentials provided.",
                data: {},
                error: {
                    name: "AUTH_ERROR",
                    message: "Credentials provided do not match any record"
                }
            });
        };

        const token = await generateAccessToken({ 
            phoneNumber,
            role: client.role
        });

        client.lastLogin = new Date();
        client.save()

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Login successful",
            data: { token },
            error: {}
        })
    } catch(error: any) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Login failed. Please try again later.",
            data: {},
            error: {
                name: "AUTH_ERROR",
                message: error?.message
            }
        });
    };
};

export const clientSignup = async(req: Request, res: Response) => {
    try{
        const { clientName, phoneNumber, email, password, role }: IClientRegister = req.body;
        if(!clientName || !phoneNumber || !email || !password ) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Bad credentials provided",
                data: {},
                error: {
                    name: "VALIDATION_ERROR",
                    message: "Missing clientName, phoneNumber, email, or password payload."
                }
            });
        }

        const isClientAvailable = await Client.findOne({ phoneNumber, email });
        if(isClientAvailable) {
            return res.status(StatusCodes.OK).json({
                success: false,
                message: "User/ client record already exists",
                data: {},
                error: {
                    name: "DUPLICATE_ERROR",
                    message: "Record with same email or phone number already exists"
                }
            });
        };

        const hashedPassword = await hashPassword(password);

        const client = await Client.create({
            clientName,
            phoneNumber,
            email,
            password: hashedPassword
        });

        const token = await generateAccessToken({ phoneNumber, role: client.role});
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Account created successfully",
            data: {
                token
            },
            error: {}
        });
    } catch(error: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Registration failed. Please try again later.",
            data: {},
            error: {
                name: error?.name || "SERVER_ERROR",
                message: error?.message || "An error occurred during account registration"
            }
        });
    };
};



