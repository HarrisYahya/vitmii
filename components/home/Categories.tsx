"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import useEmblaCarousel from "embla-carousel-react";

type Category = {
  id: string;
  name: string;
  image: string | null;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    if (!error) setCategories(data || []);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="w-full py-6 px-4">
      {/* Header with buttons */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Categories</h2>

        <div className="flex gap-2">
          {/* <button
            onClick={scrollPrev}
            className="px-3 py-1 rounded bg-gray-200 text-sm"
          >
            Prev
          </button>
          <button
            onClick={scrollNext}
            className="px-3 py-1 rounded bg-gray-200 text-sm"
          >
            Next
          </button> */}
        </div>
      </div>

      {/* Carousel wrapper */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="
                flex-none 
                w-[110px] 
                border rounded-xl p-3 
                flex flex-col items-center text-center 
                bg-white shadow-sm
              "
            >
              <img
                src={cat.image || "/images/placeholder.png"}
                alt={cat.name}
                className="h-14 w-14 object-cover rounded mb-2"
              />
              <p className="font-medium text-sm">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
