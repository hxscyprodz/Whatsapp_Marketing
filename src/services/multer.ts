import multer from "multer";
import { Request } from "express";
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if(!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'));
    };

    cb(null, true)
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter
});

export default upload;