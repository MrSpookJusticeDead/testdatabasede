import { betterAuth } from "better-auth";
import { createClient } from "@libsql/client";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Resend } from "resend";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const resend = new Resend(process.env.RESEND_API_KEY);

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
    async sendVerificationEmail({ user, url, token }, request) {
      try {
        const data = await resend.emails.send({
          from: "Insanity <onboarding@resend.dev>", // Resend's sandbox
          to: user.email,
          subject: "Verify your email - Insanity",
          html: `
            <h1>Welcome!</h1>
            <p>Click the link below to verify your email:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">Verify Email</a>
            <p>Or copy this link: <a href="${url}">${url}</a></p>
          `,
        });
        console.log("Email sent successfully:", data);
      } catch (error) {
        console.error("❌ Failed to send email:", error);
        console.log(" Verification URL for", user.email, ":", url);
      }
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
});