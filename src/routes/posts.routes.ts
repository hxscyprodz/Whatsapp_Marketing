import { Router } from "express";
import upload from "../services/multer";
import { createPost, getPost, getPosts, updatePost, deletePost } from "../controllers/posts.controller"

const router = Router();

router.route("/").get(getPosts).post(upload.single('image'),createPost);
router.route("/:id").get(getPost).patch(updatePost).delete(deletePost)

export default router;