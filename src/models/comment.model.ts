import mongoose, { Document, Schema, Types } from "mongoose";
import { IReaction } from "./post.model";

export interface IComment extends Document {
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  reactions: IReaction[];
  createdAt: Date;
  updatedAt: Date;
}

const reactionSchema = new Schema<IReaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["like", "love", "haha", "sad", "angry"],
      required: true,
    },
  },
  { _id: false }
);

const commentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    reactions: [reactionSchema],
  },
  { timestamps: true }
);

export const Comment = mongoose.model<IComment>("Comment", commentSchema);