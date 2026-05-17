import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/user.model";
import redis from "../config/redis";
import { verifySchema } from "../schemas/auth.schema";

export const verifyAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = verifySchema.parse(req.body);

    const user = await User.findOne({ email: data.email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: "Account already verified" });
      return;
    }

    const storedOtp = await redis.get(`otp:${data.email}`);

    if (!storedOtp) {
      res.status(400).json({
        message: "OTP expired or not requested",
      });
      return;
    }

    if (String(storedOtp) !== String(data.otp)) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    user.isVerified = true;

    await user.save();

    await redis.del(`otp:${data.email}`);

    res.json({ message: "Account verified successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }

    res.status(500).json({ message: "Server error" });
  }
};