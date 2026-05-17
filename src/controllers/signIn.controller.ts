import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { signInSchema } from "../schemas/auth.schema";

export const signIn = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = signInSchema.parse(req.body);

    const user = await User.findOne({ email: data.email });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ message: "Verify account first" });
      return;
    }

    const isMatch = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login success",
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};