import { betterAuth } from "better-auth";
import { createClient } from "@libsql/client";
import { LibsqlDialect } from "@libsql/kysely-libsql";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log("DB URL:", process.env.TURSO_DATABASE_URL);
console.log("Auth URL:", process.env.BETTER_AUTH_URL);

export const auth = betterAuth({
  database: {
    dialect: new LibsqlDialect({
      client: client as any,
    }),
    type: "sqlite",
  },
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
});