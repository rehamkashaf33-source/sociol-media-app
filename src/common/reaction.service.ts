import { Types } from "mongoose";

type ReactionType = "like" | "love" | "haha" | "sad" | "angry";

interface Reaction {
  user: Types.ObjectId;
  type: ReactionType;
}
export function applyReaction(
  reactions: Reaction[],
  userId: string,
  type: ReactionType
): { reactions: Reaction[]; action: "added" | "updated" | "removed" } {
  const existingIndex = reactions.findIndex(
    (r) => r.user.toString() === userId
  );
  if (existingIndex !== -1 && reactions[existingIndex].type === type) {
    reactions.splice(existingIndex, 1);
    return { reactions, action: "removed" };
  }

  if (existingIndex !== -1) {
    reactions[existingIndex].type = type;
    return { reactions, action: "updated" };
  }
  reactions.push({ user: new Types.ObjectId(userId), type });
  return { reactions, action: "added" };
}