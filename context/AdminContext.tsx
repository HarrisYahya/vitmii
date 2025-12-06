 // context/AdminContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

 type Order = {
  id: string;
  total_price: number;
  created_at: string;
  items: any[];

  // ✅ ADD THESE:
  customer_phone: string | null;
  district: string | null;
};


type AdminContextType = {
  products: Product[];
  categories: Category[];
  orders: Order[];
  heroImages: HeroImage[];
  refresh: () => Promise<void>;
};

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);

  async function loadData() {
    // Load products / categories / orders / hero_images in parallel
    const [
      { data: productData },
      { data: categoryData },
      { data: orderData },
      { data: heroData },
    ] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("categories").select("*"),
      supabase.from("orders").select("*"),
      // order by position if available, then created_at
      supabase
        .from("hero_images")
        .select("*")
        .order("position", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true }),
    ]);

    setProducts((productData as Product[] | null) || []);
    setCategories((categoryData as Category[] | null) || []);
    setOrders((orderData as Order[] | null) || []);
    setHeroImages((heroData as HeroImage[] | null) || []);
  }

  useEffect(() => {
    loadData();
  }, []);

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

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be inside AdminProvider");
  return ctx;
};
