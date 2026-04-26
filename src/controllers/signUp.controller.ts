import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { signUpSchema } from "../schemas/auth.schema";

export const signUp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = signUpSchema.parse(req.body);

    const userExist = await User.findOne({ email: data.email });

    if (userExist) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await User.create({
      username: data.username,
      email: data.email,
      password: hashedPassword,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    console.log("OTP:", otp);

    res.status(201).json({
      message: "Account created, verify OTP",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};