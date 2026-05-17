import { z } from "zod";
export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .trim(),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),

  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const sendOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
});

export const verifySchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  otp: z
    .string()
    .trim()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^[0-9]+$/, "OTP must be numbers only"),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  otp: z
    .string()
    .trim()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^[0-9]+$/, "OTP must be numbers only"),

  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),

  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
})
.refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;