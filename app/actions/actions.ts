"use server";

import { createClient } from "@libsql/client/web";
import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function ensureTables() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (e) {
    console.error("Table creation error:", e);
  }
}

export const getMessages = cache(async () => {
  await ensureTables();
  try {
    const result = await db.execute("SELECT * FROM messages ORDER BY id DESC LIMIT 50");
    return { success: true, rows: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

export async function postMessage(content: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { success: false, error: "Unauthorized. Please register or sign in." };
  }

  if (!content || !content.trim()) {
    return { success: false, error: "Message cannot be empty." };
  }

  await ensureTables();

  try {
    await db.execute({
      sql: "INSERT INTO messages (user_id, username, content) VALUES (?, ?, ?)",
      args: [
        session.user.id, 
        session.user.name || session.user.email.split("@")[0], 
        content.trim()
      ],
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}