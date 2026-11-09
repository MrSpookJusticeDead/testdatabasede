import { getMessages } from "./actions/actions";
import GlobalChatClient from "./GlobalChatClient";

export const dynamic = "force-dynamic";

export interface MessageRecord {
  id: number;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}

export default async function Page() {
  const res = await getMessages();
  
  const initialMessages: MessageRecord[] = res.success && res.rows 
    ? res.rows.map((row: any) => ({
        id: Number(row.id),
        user_id: String(row.user_id),
        username: String(row.username),
        content: String(row.content),
        created_at: String(row.created_at || ""),
      })).reverse() // Oldest to newest
    : [];

  return <GlobalChatClient initialMessages={initialMessages} />;
}