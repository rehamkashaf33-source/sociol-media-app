import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFriendship extends Document {
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  updatedAt: Date;
}

const friendshipSchema = new Schema<IFriendship>(
  {
    requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Friendship = mongoose.model<IFriendship>("Friendship", friendshipSchema);