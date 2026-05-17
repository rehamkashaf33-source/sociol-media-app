import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReaction {
  user: Types.ObjectId;
  type: "like" | "love" | "haha" | "sad" | "angry";
}

export interface IPost extends Document {
  author: Types.ObjectId;
  content: string;
  image?: string;
  reactions: IReaction[];
  comments: Types.ObjectId[];
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

const postSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    image: { type: String },
    reactions: [reactionSchema],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export const Post = mongoose.model<IPost>("Post", postSchema);