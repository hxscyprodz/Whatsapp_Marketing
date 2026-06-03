import { IPost } from "../types/types";
import { Schema, model } from "../libs/mongoose.lib";
import { PostType } from "../types/types";

const postSchema = new Schema<IPost>({
    caption: { type: String, required: true },
    imageUrl: { type: String, required: true },
    postType: { type: String, enum: Object.values(PostType), default: PostType.POST },
    posted: { type: Boolean, default: false }
});

const PostModel = model<IPost>("Post", postSchema);

export default PostModel;