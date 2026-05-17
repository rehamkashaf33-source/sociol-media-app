import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(5000, "Content too long"),

  image: z
    .string()
    .url("Invalid image URL")
    .optional(),
});

export const reactionSchema = z.object({
  type: z.enum([
    "like",
    "love",
    "haha",
    "sad",
    "angry",
  ]),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment too long"),
});

export const friendRequestSchema = z.object({
  recipientId: z.string().min(1, "Recipient ID is required"),
});

export const friendActionSchema = z.object({
  requesterId: z.string().min(1, "Requester ID is required"),
});

export const removeFriendSchema = z.object({
  friendId: z.string().min(1, "Friend ID is required"),
});

export const blockUserSchema = z.object({
  targetId: z.string().min(1, "Target user ID is required"),
});

export const searchSchema = z.object({
  q: z.string().trim().min(1, "Search query is required"),
});

export type CreatePostInput =
  z.infer<typeof createPostSchema>;

export type ReactionInput =
  z.infer<typeof reactionSchema>;

export type CreateCommentInput =
  z.infer<typeof createCommentSchema>;

export type FriendRequestInput =
  z.infer<typeof friendRequestSchema>;

export type FriendActionInput =
  z.infer<typeof friendActionSchema>;

export type RemoveFriendInput =
  z.infer<typeof removeFriendSchema>;

export type BlockUserInput =
  z.infer<typeof blockUserSchema>;

export type SearchInput =
  z.infer<typeof searchSchema>;