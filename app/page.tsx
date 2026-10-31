"use client";

import { useState, useEffect, FormEvent } from "react";
import { getUsers, registerUser, clearDatabase } from "./actions";

interface UserRecord {
  id: number;
  username: string;
  ip_address: string;
  created_at: string;
}

export default function Home() {
  const [currentIp, setCurrentIp] = useState<string>("192.168.1.101");
  const [username, setUsername] = useState<string>("");
  const [databaseUsers, setDatabaseUsers] = useState<UserRecord[]>([]);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

  const fetchUsers = async () => {
    const res = await getUsers();
    if (res.success && res.rows) {
      const formattedRows: UserRecord[] = res.rows.map((row: any) => ({
        id: Number(row.id),
        username: String(row.username),
        ip_address: String(row.ip_address),
        created_at: String(row.created_at || ""),
      }));
      setDatabaseUsers(formattedRows);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const generateRandomIp = (): string => {
    const octet3 = Math.floor(Math.random() * 50) + 1;
    const octet4 = Math.floor(Math.random() * 200) + 2;
    return `192.168.${octet3}.${octet4}`;
  };

  const handleRotateIp = () => {
    setCurrentIp(generateRandomIp());
    setStatus(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedUser = username.trim();
    if (!trimmedUser) return;

    const res = await registerUser(trimmedUser, currentIp);

    if (res.success) {
      setStatus({
        message: `SUCCESS: User '${trimmedUser}' inserted into database.`,
        isError: false,
      });
      setUsername("");
      await fetchUsers();
    } else {
      setStatus({
        message: `ERROR: ${res.error}`,
        isError: true,
      });
    }
  };

  const handleClearDb = async () => {
    const res = await clearDatabase();
    if (res.success) {
      setDatabaseUsers([]);
      setStatus(null);
    }
  };

  return (
    <main
      style={{
        fontFamily: "monospace",
        backgroundColor: "#c0c0c0",
        color: "#000",
        margin: "0",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          border: "2px solid #000",
          padding: "15px",
        }}
      >
        
        <h1
          style={{
            marginTop: 0,
            textAlign: "center",
            borderBottom: "2px solid #000",
            paddingBottom: "10px",
          }}
        >
          === database test ===
        </h1>

        {/* bar */}
        <div
          style={{
            backgroundColor: "#eee",
            border: "1px solid #777",
            padding: "8px",
            marginBottom: "15px",
          }}
        >
          <strong>YOUR SIMULATED IP:</strong>{" "}
          <span style={{ color: "blue" }}>{currentIp}</span>
          <button
            onClick={handleRotateIp}
            style={{ marginLeft: "10px", cursor: "pointer" }}
          >
            [ Switch IP ]
          </button>
        </div>

        {/* Registration Form */}
        <fieldset
          style={{ border: "2px solid #000", marginBottom: "20px" }}
        >
          <legend>
            <strong>[ Add New User ]</strong>
          </legend>
          <p style={{ fontSize: "12px", marginTop: "2px" }}>
          one username per IP address
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="username">
              <strong>Username:</strong>
            </label>{" "}
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              maxLength={20}
              style={{ padding: "3px" }}
            />{" "}
            <button
              type="submit"
              style={{ cursor: "pointer", padding: "3px 10px" }}
            >
              <strong>Submit</strong>
            </button>
          </form>

          {status && (
            <div
              style={{
                marginTop: "10px",
                padding: "5px",
                border: "1px solid #000",
                backgroundColor: status.isError ? "#ffcccc" : "#ccffcc",
                color: status.isError ? "#990000" : "#006600",
              }}
            >
              <span>{status.message}</span>
            </div>
          )}
        </fieldset>

        {/* Registered Usernames Quick View */}
        <fieldset
          style={{ border: "2px solid #000", marginBottom: "20px" }}
        >
          <legend>
            <strong>[ Registered Usernames ]</strong>
          </legend>
          <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
            {databaseUsers.length === 0 ? (
              <li>
                <em>No users registered.</em>
              </li>
            ) : (
              databaseUsers.map((user) => (
                <li key={user.id}>
                  <strong>{user.username}</strong> ({user.ip_address})
                </li>
              ))
            )}
          </ul>
        </fieldset>

        {/* Database Table View */}
        <fieldset style={{ border: "2px solid #000" }}>
          <legend>
            <strong>[ Turso Database View: `users` ]</strong>
          </legend>

          <div style={{ marginBottom: "10px", textAlign: "right" }}>
            <button onClick={handleClearDb} style={{ cursor: "pointer" }}>
              Clear Database
            </button>
          </div>

          <table
            border={1}
            cellPadding={5}
            cellSpacing={0}
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead style={{ backgroundColor: "#ddd" }}>
              <tr>
                <th>id</th>
                <th>username</th>
                <th>ip_address</th>
                <th>created_at</th>
              </tr>
            </thead>
            <tbody>
              {databaseUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <strong>{user.username}</strong>
                  </td>
                  <td>{user.ip_address}</td>
                  <td>{user.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {databaseUsers.length === 0 && (
            <p style={{ textAlign: "center", color: "#555" }}>
              No records found in database.
            </p>
          )}

          <p style={{ fontSize: "12px", marginBottom: 0 }}>
            Total Records: {databaseUsers.length}
          </p>
        </fieldset>

        <hr style={{ marginTop: "20px", border: "1px solid #000" }} />
        <p style={{ fontSize: "11px", textAlign: "center", marginBottom: 0 }}>
          Schema:{" "}
          <code>
            CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username
            TEXT NOT NULL, ip_address TEXT UNIQUE NOT NULL, created_at NUMERIC
            DEFAULT CURRENT_TIMESTAMP);
          </code>
        </p>
      </div>
    </main>
  );
}