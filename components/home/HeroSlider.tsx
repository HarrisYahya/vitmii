// components/home/HeroSlider.tsx  (or components/home/HeroSlider.tsx)
"use client";

import React from "react";
import { supabase } from "@/lib/supabase";

export default function HeroSlider() {
  const [images, setImages] = React.useState<string[]>([]);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("hero_images")
        .select("image, position")
        .order("position", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });
      if (data) {
        setImages((data as any[]).map((d) => d.image));
      }
    }
    load();
  }, []);

  React.useEffect(() => {
    if (!images || images.length === 0) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-[#fef9f5] flex items-center justify-center">
        <p>No slider images</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 bg-[#fef9f5] flex items-center justify-center overflow-hidden">
      <img src={images[index]} className="h-56 object-contain transition-all duration-700" />
    </div>
  );
}
