"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* =====================================================
   TYPES
===================================================== */

export type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string | null;
  category: string | null;
  created_at?: string | null;
};

export type Category = {
  id: string;
  name: string;
  image: string | null;
  created_at?: string | null;
};

export type HeroImage = {
  id: string;
  image: string;
  position?: number | null;
  created_at?: string | null;
};

export type Order = {
  id: string;
  total_price: number;
  created_at: string;
  items: any[];

  customer_phone: string | null;
  district: string | null;

  // ✅ REQUIRED FOR ADMIN (MARK AS READ, UNREAD COUNT)
  read?: boolean;
};

/* =====================================================
   CONTEXT TYPE
===================================================== */

type AdminContextType = {
  products: Product[];
  categories: Category[];
  orders: Order[];
  heroImages: HeroImage[];
  refresh: () => Promise<void>;
};

/* =====================================================
   CONTEXT
===================================================== */

const AdminContext = createContext<AdminContextType | null>(null);

/* =====================================================
   PROVIDER
===================================================== */

export const AdminProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);

  /* =====================================================
     LOAD ALL ADMIN DATA
  ===================================================== */

  const loadData = async () => {
    const [
      { data: productData },
      { data: categoryData },
      { data: orderData },
      { data: heroData },
    ] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("categories").select("*"),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("hero_images")
        .select("*")
        .order("position", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true }),
    ]);

    setProducts((productData as Product[]) || []);
    setCategories((categoryData as Category[]) || []);
    setOrders((orderData as Order[]) || []);
    setHeroImages((heroData as HeroImage[]) || []);
  };

  /* =====================================================
     INIT LOAD
  ===================================================== */

  useEffect(() => {
    loadData();
  }, []);

  /* =====================================================
     PROVIDER VALUE
  ===================================================== */

  return (
    <AdminContext.Provider
      value={{
        products,
        categories,
        orders,
        heroImages,
        refresh: loadData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

/* =====================================================
   HOOK
===================================================== */

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used inside AdminProvider");
  }
  return ctx;
};
