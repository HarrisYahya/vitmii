"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
  image: string | null;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  async function loadCategories() {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="w-full py-6 px-4">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="border rounded p-3 flex flex-col items-center text-center bg-white shadow"
          >
            <img
              src={
                cat.image
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/categories/${cat.image}`
                  : "/images/placeholder.png"
              }
              className="h-12 w-12 object-cover rounded mb-2" 
            />
            <p className="font-medium text-sm">{cat.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
