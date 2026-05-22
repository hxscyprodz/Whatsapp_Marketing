import { Schema, model } from "mongoose";
import { TGroup } from "../types/types";

const groupSchema = new Schema<TGroup>({
  id: { type: String, required: true },
  name: { type: String, required: true },
});

const GroupModel = model<TGroup>("Group", groupSchema);

export default GroupModel;
