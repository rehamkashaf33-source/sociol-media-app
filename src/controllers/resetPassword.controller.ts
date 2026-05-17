import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/user.model";
import { resetPasswordSchema } from "../schemas/auth.schema";
import redis from "../config/redis";

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = resetPasswordSchema.parse(req.body);

    const user = await User.findOne({ email: data.email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
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
      res.status(400).json({
        message: "Invalid OTP",
      });
      return;
    }

    user.password = await bcrypt.hash(data.newPassword, 12);

    await user.save();

    await redis.del(`otp:${data.email}`);

    res.json({ message: "Password reset success" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: error.issues[0].message,
      });
      return;
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};