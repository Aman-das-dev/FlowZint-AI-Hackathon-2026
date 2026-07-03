import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" }, // NextAuth v5 credentials provider requires JWT session strategy
  ...authConfig,
  providers: [
    ...authConfig.providers,
    CredentialsProvider({
      id: "email-password",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(8),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return null;

        return user;
      },
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone Number OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            phone: z.string(),
            otp: z.string().length(6),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const { phone, otp } = parsed.data;

        // Verify Twilio Verify Service if SID is configured
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
          try {
            const verification = await client.verify.v2
              .services(verifyServiceSid)
              .verificationChecks.create({ to: phone, code: otp });

            if (verification.status !== "approved") return null;
          } catch (err) {
            console.error("Twilio OTP Verification Failure:", err);
            return null;
          }
        } else {
          // Fallback to local DB-hashed Verification
          const otpRecord = await db.otpCode.findUnique({ where: { phone } });
          if (!otpRecord) return null;

          if (new Date() > otpRecord.expiresAt) {
            await db.otpCode.delete({ where: { phone } });
            return null;
          }

          const isOtpValid = await bcrypt.compare(otp, otpRecord.codeHash);
          if (!isOtpValid) return null;

          // Delete OTP code on success
          await db.otpCode.delete({ where: { phone } });
        }

        // Fetch or Create phone user
        let user = await db.user.findUnique({ where: { phone } });
        if (!user) {
          user = await db.user.create({
            data: {
              phone,
              phoneVerified: new Date(),
              name: `Phone User ${phone.slice(-4)}`,
            },
          });
        } else if (!user.phoneVerified) {
          user = await db.user.update({
            where: { id: user.id },
            data: { phoneVerified: new Date() },
          });
        }

        return user;
      },
    }),
  ],
});
