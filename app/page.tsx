"use client";

import Header from "@/components/layout/Header";
import HeroSlider from "@/components/home/HeroSlider";
import Categories from "@/components/home/Categories";
import ProductGrid from "@/components/home/ProductGrid";
import { useState } from "react";

export default function Page() {
  const [categoryId, setCategoryId] = useState<string | null>(null);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-neutral-900 flex flex-col">
      <Header />
      <HeroSlider />
      <Categories onSelect={(id) => setCategoryId(id)} />
      <ProductGrid categoryId={categoryId} />
    </div>
  );
}
