"use client";

import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { postMessage } from "./actions/actions";
import { useRouter } from "next/navigation";
import { MessageRecord } from "./page";

export default function GlobalChatClient({ initialMessages }: { initialMessages: MessageRecord[] }) {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const [messageText, setMessageText] = useState("");
  const [chatError, setChatError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setVerificationSent(false);
    
    try {
      if (isSignUp) {
        const res = await authClient.signUp.email({ 
          email, 
          password, 
          name,
          callbackURL: "/verified" // Optional: redirect after verification
        });
        if (res.error) {
          setAuthError(res.error.message || "Registration failed");
          return;
        }
        setVerificationSent(true);
      } else {
        const res = await authClient.signIn.email({ 
          email, 
          password,
          callbackURL: "/"
        });
        if (res.error) {
          setAuthError(res.error.message || "Login failed");
          return;
        }
        router.refresh();
      }
    } catch (err: any) {
      setAuthError(err.message || "An error occurred");
    }
  };

  const handleResendVerification = async () => {
    const res = await authClient.sendVerificationEmail({ email });
    if (res.error) {
      setAuthError(res.error.message || "Failed to resend email");
    } else {
      setAuthError("Verification email resent! Check your inbox.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setChatError("");

    startTransition(async () => {
      const res = await postMessage(messageText);
      if (!res.success) {
        setChatError(res.error || "Failed to send message");
      } else {
        setMessageText("");
        router.refresh();
      }
    });
  };

  // Show verification message after signup
  if (verificationSent) {
    return (
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 md:p-6">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d=" " />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Check your email!</h2>
            <p className="text-zinc-400 mb-6">
              We sent a verification link to <strong className="text-white">{email}</strong>
            </p>
            <p className="text-sm text-zinc-500 mb-4">
              Click the link in the email to verify your account, then sign in.
            </p>
            <button
              onClick={handleResendVerification}
              className="text-sm text-emerald-500 hover:text-emerald-400"
            >
              Resend verification email
            </button>
            <button
              onClick={() => {
                setVerificationSent(false);
                setIsSignUp(false);
              }}
              className="block w-full mt-4 text-sm text-zinc-400 hover:text-white"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 md:p-6">
      <header className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            social chat test
          </h1>
          <p className="text-sm text-zinc-400">Global chat room for registered users</p>
        </div>

        {!sessionLoading && session?.user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{session.user.name}</p>
              <p className="text-xs text-zinc-400">{session.user.email}</p>
            </div>
            <button
              onClick={() => authClient.signOut().then(() => router.refresh())}
              className="px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      {!sessionLoading && !session?.user ? (
        <div className="flex-1 flex items-center justify-center my-12">
          <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur">
            <div className="flex border-b border-zinc-800 mb-6">
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setAuthError(""); }}
                className={`flex-1 pb-3 text-sm font-medium transition border-b-2 ${
                  isSignUp ? "border-emerald-500 text-white" : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setAuthError(""); }}
                className={`flex-1 pb-3 text-sm font-medium transition border-b-2 ${
                  !isSignUp ? "border-emerald-500 text-white" : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Sign In
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-lg">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Spook"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-emerald-900/20"
              >
                {isSignUp ? "Register & Enter Chat" : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 max-h-[60vh] min-h-[400px]">
            {initialMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                No messages yet. Send the first message!
              </div>
            ) : (
              initialMessages.map((msg) => (
                <div key={msg.id} className="flex flex-col bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-emerald-400">{msg.username}</span>
                    <span className="text-[10px] text-zinc-500">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-200 break-words">{msg.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-zinc-900 border-t border-zinc-800">
            {chatError && (
              <div className="mb-2 text-xs text-red-400">{chatError}</div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message globally..."
                className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                disabled={isPending}
              />
              <button
                type="submit"
                disabled={isPending || !messageText.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-emerald-900/20"
              >
                {isPending ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}