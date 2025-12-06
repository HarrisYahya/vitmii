"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { AdminProvider } from "@/context/AdminContext";
import ProductManager from "@/components/admin/ProductManager";
import CategoryManager from "@/components/admin/CategoryManager";
import OrdersManager from "@/components/admin/OrdersManager";
import HeroManager from "@/components/admin/HeroManager";

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const [active, setActive] = useState<
    "categories" | "products" | "orders" | "hero"
  >("categories");

  // ✅ CLIENT-SIDE ADMIN VERIFICATION (BACKUP TO MIDDLEWARE)
  useEffect(() => {
    async function verifyAdmin() {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user || error) {
        router.replace("/admin/login");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!admin || adminError) {
        router.replace("/");
        return;
      }

      setChecking(false);
    }

    verifyAdmin();
  }, [router]);

  // ✅ Loading Shield (prevents UI flashing)
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Securing Admin Dashboard...
      </div>
    );
  }

  return (
    <AdminProvider>
      <div className="min-h-screen flex bg-gray-100">

        {/* ===== SIDEBAR ===== */}
        <aside className="w-64 bg-green-900 text-white flex flex-col p-4 space-y-4 fixed top-0 left-0 h-screen z-40">
          <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

          <button
            onClick={() => setActive("categories")}
            className={`text-left px-4 py-2 rounded ${
              active === "categories" ? "bg-green-700" : "hover:bg-green-800"
            }`}
          >
            📂 Categories
          </button>

          <button
            onClick={() => setActive("products")}
            className={`text-left px-4 py-2 rounded ${
              active === "products" ? "bg-green-700" : "hover:bg-green-800"
            }`}
          >
            🛍 Products
          </button>

          <button
            onClick={() => setActive("orders")}
            className={`text-left px-4 py-2 rounded ${
              active === "orders" ? "bg-green-700" : "hover:bg-green-800"
            }`}
          >
            📦 Orders
          </button>

          <button
            onClick={() => setActive("hero")}
            className={`text-left px-4 py-2 rounded ${
              active === "hero" ? "bg-green-700" : "hover:bg-green-800"
            }`}
          >
            🖼 Hero Slider
          </button>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 ml-64 p-6 space-y-10">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          {active === "categories" && <CategoryManager />}
          {active === "products" && <ProductManager />}
          {active === "orders" && <OrdersManager />}
          {active === "hero" && <HeroManager />}
        </main>
      </div>
    </AdminProvider>
  );
}
