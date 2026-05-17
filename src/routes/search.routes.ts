import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
  searchUsers,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from "../controllers/search.controller";

const router = Router();

router.use(protect);

router.get("/users", searchUsers);          
router.post("/block", blockUser);
router.post("/unblock", unblockUser);
router.get("/blocked", getBlockedUsers);

export default router;