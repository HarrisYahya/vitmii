"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { useThemeStore } from "@/lib/theme-store";

export default function Header() {
  const { items } = useCart();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="w-full bg-green-900 text-white flex items-center justify-between px-6 py-3 shadow fixed top-0 left-0 z-50">
      
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 text-xl font-bold">
        <span className="text-yellow-400">🐝</span> vitimiin online
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-5">

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="text-xl">
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {/* Cart */}
        <Link href="/cart" className="relative text-xl">
          🛒
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-500 rounded-full text-xs px-2">
              {items.length}
            </span>
          )}
        </Link>

        {/* User / Admin */}
        <Link href="/admin" className="text-xl">
          👤
        </Link>
      </div>
    </header>
  );
}
