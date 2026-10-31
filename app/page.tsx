"use client";

import { useState, useEffect, FormEvent } from "react";

const DB_KEY = "turso_users_demo";

interface UserRecord {
  id: number;
  username: string;
  ip_address: string;
  created_at: string;
}

export default function Home() {
  const [currentIp, setCurrentIp] = useState<string>("192.168.1.101");
  const [username, setUsername] = useState<string>("");
  const [mockDatabase, setMockDatabase] = useState<UserRecord[]>([]);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load initial data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        setMockDatabase(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load from storage", e);
    }
    setIsLoaded(true);
  }, []);

  // Sync database state changes to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(DB_KEY, JSON.stringify(mockDatabase));
    }
  }, [mockDatabase, isLoaded]);

  const getFormattedDate = (): string => {
    const now = new Date();
    return now.toISOString().replace("T", " ").substring(0, 19);
  };

  const generateRandomIp = (): string => {
    const octet3 = Math.floor(Math.random() * 50) + 1;
    const octet4 = Math.floor(Math.random() * 200) + 2;
    return `192.168.${octet3}.${octet4}`;
  };

  const handleRotateIp = () => {
    setCurrentIp(generateRandomIp());
    setStatus(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedUser = username.trim();
    if (!trimmedUser) return;

    const existingEntry = mockDatabase.find(
      (entry) => entry.ip_address === currentIp
    );

    if (existingEntry) {
      setStatus({
        message: `ERROR: UNIQUE constraint failed (ip_address=${currentIp}). IP has already registered user '${existingEntry.username}'.`,
        isError: true,
      });
    } else {
      const nextId =
        mockDatabase.length > 0
          ? Math.max(...mockDatabase.map((u) => u.id)) + 1
          : 1;

      const newUser: UserRecord = {
        id: nextId,
        username: trimmedUser,
        ip_address: currentIp,
        created_at: getFormattedDate(),
      };

      setMockDatabase((prev) => [...prev, newUser]);
      setStatus({
        message: `SUCCESS: User '${trimmedUser}' inserted into database.`,
        isError: false,
      });
      setUsername("");
    }
  };

  const handleClearDb = () => {
    setMockDatabase([]);
    localStorage.removeItem(DB_KEY);
    setStatus(null);
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
        {/* Header */}
        <h1
          style={{
            marginTop: 0,
            textAlign: "center",
            borderBottom: "2px solid #000",
            paddingBottom: "10px",
          }}
        >
          === USER REGISTRY DATABASE SYSTEM ===
        </h1>

        {/* IP Status Bar */}
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
            Note: Table constraint enforced - ONE username per IP address.
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
            {mockDatabase.length === 0 ? (
              <li>
                <em>No users registered.</em>
              </li>
            ) : (
              mockDatabase.map((user) => (
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
              {mockDatabase.map((user) => (
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

          {mockDatabase.length === 0 && (
            <p style={{ textAlign: "center", color: "#555" }}>
              No records found in database.
            </p>
          )}

          <p style={{ fontSize: "12px", marginBottom: 0 }}>
            Total Records: {mockDatabase.length}
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
