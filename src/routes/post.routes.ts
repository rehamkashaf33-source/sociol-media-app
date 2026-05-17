import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
  createPost,
  addReactionToPost,
  getFeed,
  deletePost,
} from "../controllers/post.controller";
import {
  createComment,
  addReactionToComment,
  deleteComment,
} from "../controllers/comment.controller";

const router = Router();
router.use(protect);
router.get("/feed", getFeed);
router.post("/", createPost);
router.delete("/:postId", deletePost);
router.post("/:postId/reaction", addReactionToPost);
router.post("/:postId/comments", createComment);
router.post("/comments/:commentId/reaction", addReactionToComment);
router.delete("/comments/:commentId", deleteComment);

export default router;