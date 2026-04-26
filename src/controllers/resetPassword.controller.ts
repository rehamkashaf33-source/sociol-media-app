import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { resetPasswordSchema } from "../schemas/auth.schema";

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = resetPasswordSchema.parse(req.body);

    const user = await User.findOne({ email: data.email });

    if (!user || user.otp !== data.otp) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    user.password = await bcrypt.hash(data.newPassword, 12);

    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: "Password reset success" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};