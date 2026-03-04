"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Invalid credentials");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-awsBlack via-awsGray/40 to-awsBlack">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(255,153,0,0.15),_transparent_55%)]" />

      <div className="relative z-10 max-w-md w-full mx-4 rounded-2xl border border-awsGray bg-awsBlack/80 shadow-2xl shadow-black/80 p-8 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-awsOrange">
            Internal only
          </p>
          <h1 className="text-xl font-semibold">Sign in to control panel</h1>
          <p className="text-xs text-neutral-500">
            This login is only for Mark Andrei. Visitors see the public portfolio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="space-y-1">
            <label className="text-xs text-neutral-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-awsGray bg-awsGray/40 px-3 py-2 text-sm text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange"
              placeholder="admin@andei.dev"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-neutral-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-awsGray bg-awsGray/40 px-3 py-2 text-sm text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-awsOrange py-2 text-sm font-medium text-awsBlack shadow-glow hover:brightness-110 transition-all disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

