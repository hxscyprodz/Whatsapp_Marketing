import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (
    err: any, 
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'File is too large. Maximum limit is 5MB.'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: `Unexpected field name. Did you use 'image'?`
                });
            default:
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: `Image upload error: ${err.message}`
                });
        }
    }

    // 2. Handle your custom validation errors (from fileFilter)
    if (err instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: err.message
        });
    }

    // 3. Fallback for any other unexpected server errors
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Something went wrong on the server.',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
};