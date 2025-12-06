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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-green-200"
      >
        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-green-900">Welcome Back</h1>
          <p className="text-sm text-gray-600">Login to your account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-800">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-lg px-4 py-2 
              bg-white border border-gray-300
              text-gray-900 placeholder-gray-400
              outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-800">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg px-4 py-2 
              bg-white border border-gray-300
              text-gray-900 placeholder-gray-400
              outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-900 text-white py-2.5 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          Secure admin access 2025 © Vitimiin
        </p>
      </form>
    </div>
  );
}
