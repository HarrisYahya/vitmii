"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import useEmblaCarousel from "embla-carousel-react";

type Category = {
  id: string;
  name: string;
  image: string | null;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" });

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

      {/* MOBILE CAROUSEL */}
      <div className="md:hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="min-w-[120px] border rounded p-3 flex flex-col items-center text-center bg-white shadow"
            >
              <img
                src={cat.image || "/images/placeholder.png"}
                className="h-12 w-12 object-cover rounded mb-2"
              />
              <p className="font-medium text-sm">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP GRID */}
      <div className="hidden md:grid grid-cols-4 gap-4">
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
