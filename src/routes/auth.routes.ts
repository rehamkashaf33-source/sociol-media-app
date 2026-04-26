import { Router } from "express";
import { signUp } from "../controllers/signUp.controller";
import { signIn } from "../controllers/signIn.controller";
import { sendOtp } from "../controllers/sendOtp.controller";
import { verifyAccount } from "../controllers/verify.controller";
import { resetPassword } from "../controllers/resetPassword.controller";

const router = Router();

router.post("/signup", signUp);
router.post("/send-otp", sendOtp);
router.post("/verify-account", verifyAccount);
router.post("/signin", signIn);
router.post("/reset-password", resetPassword);

export default router;