import { betterAuth } from "better-auth";
import { createClient } from "@libsql/client";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Resend } from "resend";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Only initialize Resend if the API key actually exists
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
      console.log("\n" + "=".repeat(60));
      console.log("📧 VERIFICATION ATTEMPT FOR:", user.email);
      
      if (resend) {
        try {
          const data = await resend.emails.send({
            from: "Insanity <onboarding@resend.dev>", // Resend's free sandbox domain
            to: user.email,
            subject: "Verify your email - Insanity",
            html: `
              <h1>Welcome!</h1>
              <p>Click the link below to verify your email:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">Verify Email</a>
              <p>Or copy this link: <a href="${url}">${url}</a></p>
            `,
          });
          console.log("✅ Resend Success:", data);
        } catch (error: any) {
          console.error("❌ Resend Failed:", error.message);
          console.log("🔗 FALLBACK LINK (Copy & Paste this into your browser):", url);
        }
      } else {
        console.log("⚠️ RESEND_API_KEY not found. Using console fallback.");
        console.log("🔗 COPY & PASTE THIS LINK TO VERIFY:", url);
      }
      console.log("=".repeat(60) + "\n");
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
});