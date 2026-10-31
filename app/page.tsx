// app/page.tsx
import { getUsers } from "./actions/actions";
import RegistryClient from "./RegistryClient";

export const dynamic = "force-dynamic";

export interface UserRecord {
  id: number;
  username: string;
  ip_address: string;
  created_at: string;
}

export default async function Page() {
  const res = await getUsers();
  
  const initialUsers: UserRecord[] = res.success && res.rows 
    ? res.rows.map((row: any) => ({
        id: Number(row.id),
        username: String(row.username),
        ip_address: String(row.ip_address),
        created_at: String(row.created_at || ""),
      }))
    : [];

  return <RegistryClient initialUsers={initialUsers} />;
}