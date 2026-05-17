import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/user.model";
import { sendOtpSchema } from "../schemas/auth.schema";
import nodemailer from "nodemailer";
import redis from "../config/redis";

export const sendOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = sendOtpSchema.parse(req.body);

    const user = await User.findOne({ email: data.email });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Store OTP in Redis لمدة 5 دقايق
    await redis.set(`otp:${data.email}`, otp, {
      ex: 300,
    });

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: data.email,
      subject: "Your OTP for Password Reset/Verification",
      text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    console.log("OTP:", otp);

    res.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: error.issues[0].message,
      });
      return;
    }

    console.error("Error sending OTP:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};