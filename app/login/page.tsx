"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/"); // ✅ go back to home after login
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fef9f5] px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white shadow-md rounded-lg p-6 space-y-5"
      >
        <h1 className="text-2xl font-bold text-center text-green-900">
          Login
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 rounded">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-900 text-white py-2 rounded hover:bg-green-800 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
