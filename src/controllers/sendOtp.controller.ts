import { Request, Response } from "express";
import { User } from "../models/user.model";
import { sendOtpSchema } from "../schemas/auth.schema";

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = sendOtpSchema.parse(req.body);

    const user = await User.findOne({ email: data.email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    console.log("OTP:", otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};