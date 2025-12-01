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
    <div className="w-full py-4 px-4">
      <h2 className="text-2xl font-semibold mb-3 text-white">Categories</h2>

      {/* Horizontal scroll like your screenshot */}
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="min-w-[110px] bg-[#1C1C1E] rounded-xl p-3 shadow-md flex-shrink-0 border border-gray-700"
          >
            <img
              src={
                cat.image
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/categories/${cat.image}`
                  : "/images/placeholder.png"
              }
              className="h-20 w-20 rounded-lg object-cover mx-auto"
            />

            <p className="text-white text-center mt-2 text-sm font-medium">
              {cat.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}