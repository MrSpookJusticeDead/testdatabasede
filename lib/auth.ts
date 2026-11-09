import { betterAuth } from "better-auth";
import { createClient } from "@libsql/client";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import nodemailer from "nodemailer";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Configure Nodemailer with Gmail OAuth2
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
});

export const auth = betterAuth({
  database: {
    dialect: new LibsqlDialect({
      client: client as any,
    }),
    type: "sqlite",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, 
  },
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      const mailOptions = {
        from: `"Global Pulse" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: "Verify your email - Global Pulse",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">Welcome to Global Pulse!</h1>
            <p>Thanks for signing up! Please verify your email address to get started.</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold;">Verify Email</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #f4f4f5; padding: 10px; border-radius: 6px; word-break: break-all; font-size: 14px; color: #10b981;">${url}</p>
            <p style="color: #71717a; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Verification email sent to:", user.email);
      } catch (error) {
        console.error("❌ Failed to send email via Gmail:", error);
        // Fallback: log the URL so you can still verify manually if Gmail blocks it
        console.log("🔗 FALLBACK Verification URL:", url);
      }
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
});