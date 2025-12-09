"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { useThemeStore } from "@/lib/theme-store";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const { items } = useCart();
  const { theme, toggleTheme } = useThemeStore();

  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ Get logged-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ✅ Check if user is admin
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(!!data);
      });
  }, [user]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="w-full bg-green-900 text-white flex items-center justify-between px-6 py-3 shadow fixed top-0 left-0 z-50">
      
      {/* Brand */}
       {/* Brand */}
<Link
  href="/"
  className="flex items-center gap-2 font-semibold tracking-wide"
>
  <img
    src="/images/logo.jpg"
    alt="Vitimiin Online Logo"
    className="h-8 w-8 object-contain rounded-full border border-white"
  />
  <span className="whitespace-nowrap">vitimiin online</span>
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

        {/* ✅ Admin only */}
        {isAdmin && (
          <Link href="/admin" className="text-xl">
            👤
          </Link>
        )}

        {/* ✅ Auth Button 
          {!user ? (
          <Link href="/login" className="text-sm bg-white text-green-900 px-3 py-1 rounded">
            Login
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button> */}
      </div>
    </header>
  );
}
