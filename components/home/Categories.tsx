"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import useEmblaCarousel from "embla-carousel-react";

type Category = {
  id: string;
  name: string;
  image: string | null;
};

type Props = {
  onSelect: (id: string | null) => void;
};

export default function Categories({ onSelect }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [emblaRef] = useEmblaCarousel({ loop: false, align: "start" });

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("categories").select("*");
      setCategories(data || []);
    }
    load();
  }, []);

  return (
    <div className="w-full px-4 py-4">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">

          {/* ALL */}
          <button
            onClick={() => onSelect(null)}
            className="min-w-[90px] flex flex-col items-center p-2 bg-gray-100 rounded-xl"
          >
            <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">All</span>
            </div>
            <span className="text-sm mt-1">All</span>
          </button>

          {/* Categories */}
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="min-w-[90px] flex flex-col items-center p-2 bg-gray-100 rounded-xl"
            >
              <img
                src={c.image || "/placeholder.png"}
                alt={c.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <span className="text-sm mt-1">{c.name}</span>
            </button>
          ))}

        </div>
      </div>
    </div>
  );
}
