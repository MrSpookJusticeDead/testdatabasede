"use server";

import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function getUsers() {
  try {
    const result = await db.execute("SELECT * FROM users");
    return { success: true, rows: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function registerUser(username: string, ipAddress: string) {
  try {
    await db.execute({
      sql: "INSERT INTO users (username, ip_address) VALUES (?, ?)",
      args: [username, ipAddress],
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function clearDatabase() {
  try {
    await db.execute("DELETE FROM users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}