import { Response } from "express";
import { z } from "zod";
import { Post } from "../models/post.model";
import { Comment } from "../models/comment.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { createCommentSchema, reactionSchema } from "../schemas/social.schema";
import { applyReaction } from "../common/reaction.service";
export const createComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const data = createCommentSchema.parse(req.body);
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const comment = new Comment({
      post: postId,
      author: req.userId,
      content: data.content,
    });
    await comment.save();
    post.comments.push(comment._id as any);
    await post.save();

    const populated = await comment.populate("author", "username");

    res.status(201).json({ message: "Comment added", comment: populated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};
export const addReactionToComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const data = reactionSchema.parse(req.body);
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    const { reactions, action } = applyReaction(
      comment.reactions as any,
      req.userId!,
      data.type
    );

    comment.reactions = reactions as any;
    await comment.save();

    res.json({ message: `Reaction ${action}`, reactions: comment.reactions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};
export const deleteComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    if (comment.author.toString() !== req.userId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    await comment.deleteOne();

    res.json({ message: "Comment deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};