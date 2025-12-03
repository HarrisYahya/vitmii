// app/admin/page.tsx
"use client";

import { AdminProvider } from "@/context/AdminContext";
import ProductManager from "@/components/admin/ProductManager";
import CategoryManager from "@/components/admin/CategoryManager";
import OrdersManager from "@/components/admin/OrdersManager";
import HeroManager from "@/components/admin/HeroManager";
export default function AdminPage() {
  return (
    <AdminProvider>
      <div className="p-6 space-y-10">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <CategoryManager />
        <ProductManager />
        <OrdersManager />
        
      </div>
    </AdminProvider>
  );
}
