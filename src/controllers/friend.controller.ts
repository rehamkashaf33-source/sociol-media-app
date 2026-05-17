import { Response } from "express";
import { z } from "zod";
import { Friendship } from "../models/friendship.model";
import { User } from "../models/user.model";
import { Block } from "../models/block.model";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  friendRequestSchema,
  friendActionSchema,
  removeFriendSchema,
} from "../schemas/social.schema";
export const sendFriendRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const data = friendRequestSchema.parse(req.body);
    const requesterId = req.userId!;
    const recipientId = data.recipientId;

    if (requesterId === recipientId) {
      res.status(400).json({ message: "Cannot send request to yourself" });
      return;
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isBlocked = await Block.findOne({
      $or: [
        { blocker: requesterId, blocked: recipientId },
        { blocker: recipientId, blocked: requesterId },
      ],
    });
    if (isBlocked) {
      res.status(403).json({ message: "Cannot send request" });
      return;
    }
    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing) {
      res.status(400).json({ message: "Friend request already exists" });
      return;
    }

    const friendship = await Friendship.create({
      requester: requesterId,
      recipient: recipientId,
    });

    res.status(201).json({ message: "Friend request sent", friendship });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};
export const acceptFriendRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const data = friendActionSchema.parse(req.body);

    const friendship = await Friendship.findOne({
      requester: data.requesterId,
      recipient: req.userId,
      status: "pending",
    });

    if (!friendship) {
      res.status(404).json({ message: "Friend request not found" });
      return;
    }

    friendship.status = "accepted";
    await friendship.save();

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};
export const declineFriendRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const data = friendActionSchema.parse(req.body);

    const friendship = await Friendship.findOne({
      requester: data.requesterId,
      recipient: req.userId,
      status: "pending",
    });

    if (!friendship) {
      res.status(404).json({ message: "Friend request not found" });
      return;
    }

    friendship.status = "declined";
    await friendship.save();

    res.json({ message: "Friend request declined" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};
export const removeFriend = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const data = removeFriendSchema.parse(req.body);

    const friendship = await Friendship.findOneAndDelete({
      status: "accepted",
      $or: [
        { requester: req.userId, recipient: data.friendId },
        { requester: data.friendId, recipient: req.userId },
      ],
    });

    if (!friendship) {
      res.status(404).json({ message: "Friendship not found" });
      return;
    }

    res.json({ message: "Friend removed" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};
export const getFriends = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const friendships = await Friendship.find({
      status: "accepted",
      $or: [{ requester: req.userId }, { recipient: req.userId }],
    })
      .populate("requester", "username email")
      .populate("recipient", "username email");

    const friends = friendships.map((f) =>
      f.requester.toString() === req.userId ? f.recipient : f.requester
    );

    res.json({ friends });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
export const getPendingRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const requests = await Friendship.find({
      recipient: req.userId,
      status: "pending",
    }).populate("requester", "username email");

    res.json({ requests });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};