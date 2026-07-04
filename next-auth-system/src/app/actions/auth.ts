"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Password constraints: min 8 chars, 1 number, 1 special character
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: passwordSchema,
});

const phoneSchema = z.string().min(10, "Phone number must be at least 10 characters");

/**
 * Register User with email/password
 */
export async function registerUser(values: z.infer<typeof registerSchema>) {
  const validated = registerSchema.safeParse(values);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { name, email, password } = validated.data;
  
  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Email is already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Email verification flow (Nodemailer config template)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST || "localhost",
        port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
        auth: {
          user: process.env.EMAIL_SERVER_USER || "",
          pass: process.env.EMAIL_SERVER_PASSWORD || "",
        },
      });

      let verifyLink = "";
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await db.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: expiry,
        },
      });

      const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      verifyLink = `${appUrl}/api/auth/verify-email?token=${verificationToken}`;

      if (process.env.EMAIL_SERVER_USER) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "noreply@authsystem.local",
          to: email,
          subject: "Verify your email address",
          html: `<p>Please verify your email by clicking: <a href="${verifyLink}">${verifyLink}</a></p>`,
        });
      } else {
        console.log(`[DEV MODE] Email verification link for ${email}: ${verifyLink}`);
      }

      return { 
        success: "User registered successfully! Please check your email for a verification link.",
        devVerifyLink: process.env.NODE_ENV !== "production" ? verifyLink : undefined 
      };
    } catch (emailErr) {
      console.error("Nodemailer failed, skipping link send:", emailErr);
      return { 
        success: "User registered successfully! Please check your email for a verification link." 
      };
    }
  } catch (err: any) {
    return { error: "Registration failed. Please try again." };
  }
}

/**
 * Send OTP Code to user phone
 */
export async function sendOtp(phone: string) {
  const validated = phoneSchema.safeParse(phone);
  if (!validated.success) {
    return { error: "Invalid phone number format" };
  }

  const cleanPhone = phone.trim();

  // Rate Limiting (max 3 OTPs per phone in 15 minutes)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const recentOtpsCount = await db.otpCode.count({
    where: {
      phone: cleanPhone,
      createdAt: { gte: fifteenMinutesAgo },
    },
  });

  if (recentOtpsCount >= 3) {
    return { error: "Too many OTP requests. Please wait 15 minutes." };
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(otpCode, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

  try {
    // Save to DB (upsert code)
    await db.otpCode.upsert({
      where: { phone: cleanPhone },
      update: { codeHash, expiresAt, createdAt: new Date() },
      create: { phone: cleanPhone, codeHash, expiresAt },
    });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    const isTwilioConfigured = 
      accountSid && 
      authToken && 
      verifyServiceSid && 
      !accountSid.startsWith("your_") && 
      !verifyServiceSid.startsWith("your_");

    if (isTwilioConfigured) {
      const twilio = require("twilio");
      const client = twilio(accountSid, authToken);
      await client.verify.v2
        .services(verifyServiceSid)
        .verifications.create({ to: cleanPhone, channel: "sms" });
    } else {
      // Dev fallback console logger
      console.log(`\n======================================\n[DEV MODE] OTP Code for ${cleanPhone}: ${otpCode}\n======================================\n`);
    }

    return { success: "OTP sent successfully!", devOtp: process.env.NODE_ENV !== "production" ? otpCode : undefined };
  } catch (err: any) {
    console.error("OTP send error:", err);
    return { error: "Failed to send OTP code. Please try again." };
  }
}

/**
 * Request Password Reset token
 */
export async function requestPasswordReset(email: string) {
  if (!email || !email.includes("@")) {
    return { error: "Invalid email address" };
  }

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Mitigate email enumeration by showing generic success
      return { success: "If the email is registered, you will receive a reset link shortly." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token: resetToken } },
      update: { token: resetToken, expires: expiry },
      create: { identifier: email, token: resetToken, expires: expiry },
    });

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || "localhost",
      port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
      auth: {
        user: process.env.EMAIL_SERVER_USER || "",
        pass: process.env.EMAIL_SERVER_PASSWORD || "",
      },
    });

    if (process.env.EMAIL_SERVER_USER) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || "noreply@authsystem.local",
        to: email,
        subject: "Password Reset Request",
        html: `<p>Click here to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
      });
    } else {
      console.log(`[DEV MODE] Password reset link for ${email}: ${resetLink}`);
    }

    return { success: "If the email is registered, you will receive a reset link shortly.", devResetLink: resetLink };
  } catch (err) {
    console.error("Password reset request failure:", err);
    return { error: "Failed to process password reset request." };
  }
}

/**
 * Execute Password Reset
 */
export async function resetPassword(values: { email: string; token: string; password: z.infer<typeof passwordSchema> }) {
  const passwordValidated = passwordSchema.safeParse(values.password);
  if (!passwordValidated.success) {
    return { error: passwordValidated.error.issues[0].message };
  }

  try {
    const tokenRecord = await db.verificationToken.findFirst({
      where: {
        identifier: values.email,
        token: values.token,
      },
    });

    if (!tokenRecord || new Date() > tokenRecord.expires) {
      return { error: "Invalid or expired reset token" };
    }

    const hashedPassword = await bcrypt.hash(values.password, 10);

    await db.user.update({
      where: { email: values.email },
      data: { password: hashedPassword },
    });

    // Delete token on completion
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: values.email,
          token: values.token,
        },
      },
    });

    return { success: "Password reset successfully! You can now log in." };
  } catch (err) {
    console.error("Reset password execution error:", err);
    return { error: "Failed to reset password. Please try again." };
  }
}
