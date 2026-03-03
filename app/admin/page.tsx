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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [active, setActive] = useState<
    "categories" | "products" | "orders" | "hero"
  >("categories");

  // ================= ADMIN VERIFY =================
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

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Securing Admin Dashboard...
      </div>
    );
  }

  return (
    <AdminProvider>
      <div className="min-h-screen bg-gray-100">

        {/* ================= SIDEBAR ================= */}
        <aside
          className={`
            fixed top-0 left-0 h-full w-64 bg-white border-r z-50
            transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
          `}
        >
          <div className="p-5 flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-8 text-green-700">
              Alnasri Admin
            </h2>

            <button
              onClick={() => {
                setActive("categories");
                setSidebarOpen(false);
              }}
              className={`px-4 py-3 rounded-xl mb-2 font-medium text-left
                ${
                  active === "categories"
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-100"
                }`}
            >
              📂 Categories
            </button>

            <button
              onClick={() => {
                setActive("products");
                setSidebarOpen(false);
              }}
              className={`px-4 py-3 rounded-xl mb-2 font-medium text-left
                ${
                  active === "products"
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-100"
                }`}
            >
              🛍 Products
            </button>

            <button
              onClick={() => {
                setActive("orders");
                setSidebarOpen(false);
              }}
              className={`px-4 py-3 rounded-xl mb-2 font-medium text-left
                ${
                  active === "orders"
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-100"
                }`}
            >
              📦 Orders
            </button>

            <button
              onClick={() => {
                setActive("hero");
                setSidebarOpen(false);
              }}
              className={`px-4 py-3 rounded-xl font-medium text-left
                ${
                  active === "hero"
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-100"
                }`}
            >
              🖼 Hero Slider
            </button>
          </div>
        </aside>

        {/* ================= OVERLAY (MOBILE ONLY) ================= */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ================= MAIN CONTENT ================= */}
        <main className="lg:ml-64 p-6 space-y-8">

          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              ☰ Menu
            </button>
            <h1 className="text-xl font-bold">Admin</h1>
          </div>

          {/* Dashboard Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>

          {/* Analytics */}
          <RevenueChart />
          <AdminStats />

          {/* Dynamic Content */}
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