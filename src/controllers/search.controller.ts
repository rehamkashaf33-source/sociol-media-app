import { Response } from "express";
import { z } from "zod";
import { User } from "../models/user.model";
import { Block } from "../models/block.model";
import { Friendship } from "../models/friendship.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { searchSchema, blockUserSchema } from "../schemas/social.schema";

export const searchUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const data = searchSchema.parse(req.query);
    const blocks = await Block.find({
      $or: [{ blocker: req.userId }, { blocked: req.userId }],
    });

    const blockedIds = blocks.map((b) =>
      b.blocker.toString() === req.userId ? b.blocked.toString() : b.blocker.toString()
    );

    const excludeIds = [...blockedIds];
    if (req.userId) excludeIds.push(req.userId);

    const users = await User.find({
      _id: { $nin: excludeIds },
      $or: [
        { username: { $regex: data.q, $options: "i" } },
        { email: { $regex: data.q, $options: "i" } },
      ],
    }).select("username email");

    res.json({ users });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};
export const blockUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const data = blockUserSchema.parse(req.body);
    const blockerId = req.userId!;
    const targetId = data.targetId;

    if (blockerId === targetId) {
      res.status(400).json({ message: "Cannot block yourself" });
      return;
    }

    const target = await User.findById(targetId);
    if (!target) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const existing = await Block.findOne({
      blocker: blockerId,
      blocked: targetId,
    });
    if (existing) {
      res.status(400).json({ message: "User already blocked" });
      return;
    }

    await Block.create({ blocker: blockerId, blocked: targetId });
    await Friendship.findOneAndDelete({
      $or: [
        { requester: blockerId, recipient: targetId },
        { requester: targetId, recipient: blockerId },
      ],
    });

    res.json({ message: "User blocked" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};
export const unblockUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const data = blockUserSchema.parse(req.body);

    const block = await Block.findOneAndDelete({
      blocker: req.userId,
      blocked: data.targetId,
    });

    if (!block) {
      res.status(404).json({ message: "Block not found" });
      return;
    }

    res.json({ message: "User unblocked" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};
export const getBlockedUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const blocks = await Block.find({ blocker: req.userId }).populate(
      "blocked",
      "username email"
    );

    res.json({ blocked: blocks.map((b) => b.blocked) });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};