import { Request, Response } from "express";
import { User } from "../models/user.model";
import { verifySchema } from "../schemas/auth.schema";

export const verifyAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = verifySchema.parse(req.body);

    const user = await User.findOne({ email: data.email });

    if (!user || user.otp !== data.otp) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: "Account verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};