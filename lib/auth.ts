import { betterAuth } from "better-auth";
import { createClient } from "@libsql/client";
import { LibsqlDialect } from "@libsql/kysely-libsql";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
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
      console.log("\n" + "=".repeat(70));
      console.log("📧 EMAIL VERIFICATION REQUIRED FOR:", user.email);
      console.log("🔗 COPY AND PASTE THIS LINK INTO YOUR BROWSER TO VERIFY:");
      console.log(url);
      console.log("=".repeat(70) + "\n");
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
});