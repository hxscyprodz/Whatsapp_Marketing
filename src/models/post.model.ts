import { IPost } from "../types/types";
import { Schema, model } from "../libs/mongoose.lib";

const postSchema = new Schema<IPost>({
    caption: { type: String, required: true },
    imageUrl: { type: String, required: true },
    scheduledTime: { type: String, required: true },
});

const PostModel = model<IPost>("Post", postSchema);

export default PostModel;