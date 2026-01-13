"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RevenueChart from "@/components/admin/RevenueChart";
import { AdminProvider } from "@/context/AdminContext";
import ProductManager from "@/components/admin/ProductManager";
import CategoryManager from "@/components/admin/CategoryManager";
import OrdersManager from "@/components/admin/OrdersManager";
import HeroManager from "@/components/admin/HeroManager";
import AdminStats from "@/components/admin/AdminStats";

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const [active, setActive] = useState<
    "categories" | "products" | "orders" | "hero"
  >("categories");

  // =====================================================
  // ✅ CLIENT-SIDE ADMIN VERIFICATION (SAFE)
  // =====================================================
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

  // =====================================================
  // ✅ LOADING SHIELD
  // =====================================================
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Securing Admin Dashboard...
      </div>
    );
  }

  return (
    <AdminProvider>
      <RevenueChart />
      <AdminStats />


      <div className="min-h-screen flex bg-gray-100">

        {/* =====================================================
            SIDEBAR
        ===================================================== */}
        <aside className="w-64 bg-white border-r flex flex-col p-5 fixed top-0 left-0 h-screen z-40">
          <h2 className="text-2xl font-bold mb-8 text-green-700">
            Alnasri Admin
          </h2>

          <button
            onClick={() => setActive("categories")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition font-medium
              ${
                active === "categories"
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            📂 Categories
          </button>

          <button
            onClick={() => setActive("products")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition font-medium
              ${
                active === "products"
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            🛍 Products
          </button>

          <button
            onClick={() => setActive("orders")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition font-medium
              ${
                active === "orders"
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            📦 Orders
          </button>

          <button
            onClick={() => setActive("hero")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium
              ${
                active === "hero"
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            🖼 Hero Slider
          </button>
        </aside>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}
        <main className="flex-1 ml-64 p-8 space-y-8">

          {/* PAGE TITLE */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Admin Dashboard
            </h1>
          </div>

          {/* CONTENT CARD */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {active === "categories" && <CategoryManager />}
            {active === "products" && <ProductManager />}
            {active === "orders" && <OrdersManager />}
            {active === "hero" && <HeroManager />}
          </div>

        </main>
      </div>
    </AdminProvider>
  );
}
