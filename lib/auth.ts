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
    requireEmailVerification: true, // Users must verify email before signing in
  },
  emailVerification: {
    async sendVerificationEmail({ user, url, token }, request) {
      await resend.emails.send({
        from: "Insanitybot <onboarding@insanity.com>", // Update with your domain
        to: user.email,
        subject: "Verify your email address",
        html: `
          <h1>Welcome!</h1>
          <p>Click the link below to verify your email:</p>
          <a href="${url}">Verify Email</a>
          <p>Or copy this link: ${url}</p>
        `,
      });
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
});