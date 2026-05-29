import { Request, Response } from "express";
import PostModel from "../models/post.model";
import { StatusCodes } from "http-status-codes";
import {
  uploadImageToSupabase,
  deleteImageFromSupabase,
} from "../services/supabase.service";
import { IPost } from "../types/types";
import mongoose from "mongoose";

const createPost = async (req: Request, res: Response) => {
  try {
    const { caption, postTime } = req.body;

    if (!caption || !postTime) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Please provide needed details",
      });
    }

    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Upload image not provided",
      });
    }

    const imageBuffer = req.file?.buffer;
    const imageName = req.file?.originalname;
    const mimeType = req.file?.mimetype;

    const newImage = await uploadImageToSupabase({
      caption,
      postTime,
      media: {
        imageBuffer,
        imageName,
        mimeType,
      },
    });

    const newPost: IPost = {
      caption,
      scheduledTime: postTime,
      imageUrl: newImage?.imageUrl || "",
    };

    await PostModel.create(newPost);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Failed to create post. Please try again later.",
      error,
    });
  }
};

const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await PostModel.find();

    if (posts.length <= 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "No posts found",
        data: [],
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Posts fetch successful",
      data: posts,
      results: posts.length,
    });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error,
      message: "Fetch posts failed.",
    });
  }
};

const getPost = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const post = await PostModel.findOne({ _id: id });
    if (!post) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Post not found",
        data: [],
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Fetch post successful",
      data: post,
      results: 1,
    });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error,
      message: "Fetch post failed.",
    });
  }
};

const updatePost = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Post updated successfully" });
};

const deletePost = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Please provide needed params",
      });
    }

    session.startTransaction();
    const post = await PostModel.findOneAndDelete({ _id: id }, { session });

    if (!post) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.imageUrl) {
      try {
        await deleteImageFromSupabase(post?.imageUrl);
      } catch (error) {
        throw new Error(
          "Supabase storage deletion failed. Rolling back database",
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Failed to delete post. Please try again later.",
    });
  }
};

export { createPost, getPosts, getPost, updatePost, deletePost };
