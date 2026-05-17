import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
} from "../controllers/friend.controller";

const router = Router();

router.use(protect);

router.get("/", getFriends);
router.get("/requests", getPendingRequests);
router.post("/request", sendFriendRequest);
router.post("/accept", acceptFriendRequest);
router.post("/decline", declineFriendRequest);
router.delete("/remove", removeFriend);

export default router;