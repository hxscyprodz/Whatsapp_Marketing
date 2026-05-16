import mongoose from "mongoose";
import { TGroup } from "../types/types";

const groupSchema = new mongoose.Schema<TGroup>({
  id: { type: String, required: true },
  name: { type: String, required: true },
});

const GroupModel = mongoose.model<TGroup>("Group", groupSchema);

export default GroupModel;
