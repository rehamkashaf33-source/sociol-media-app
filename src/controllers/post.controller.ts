import { Response } from "express";
import { z } from "zod";
import { Post } from "../models/post.model";
import { Comment } from "../models/comment.model";
import { Block } from "../models/block.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { createPostSchema, reactionSchema } from "../schemas/social.schema";
import { applyReaction } from "../common/reaction.service";

export const createPost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const data = createPostSchema.parse(req.body);

    const post = await Post.create({
      author: req.userId,
      content: data.content,
      image: data.image,
    });

    const populated = await post.populate("author", "username email");

    res.status(201).json({ message: "Post created", post: populated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};
export const addReactionToPost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const data = reactionSchema.parse(req.body);
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const { reactions, action } = applyReaction(
      post.reactions as any,
      req.userId!,
      data.type
    );

    post.reactions = reactions as any;
    await post.save();

    res.json({ message: `Reaction ${action}`, reactions: post.reactions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const getFeed = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const blocks = await Block.find({
      $or: [{ blocker: req.userId }, { blocked: req.userId }],
    });

    const blockedIds = blocks.map((b) =>
      b.blocker.toString() === req.userId ? b.blocked : b.blocker
    );

    const posts = await Post.find({ author: { $nin: blockedIds } })
      .populate("author", "username")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ posts });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
export const deletePost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.author.toString() !== req.userId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.json({ message: "Post deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};