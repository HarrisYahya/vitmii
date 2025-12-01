"use client";

import Header from "@/components/layout/Header";
import HeroSlider from "@/components/home/HeroSlider";
import Categories from "@/components/home/Categories";
import ProductGrid from "@/components/home/ProductGrid";

export default function Page() {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-neutral-900 flex flex-col">
      <Header />
      <HeroSlider />
      <Categories />
      <ProductGrid />
    </div>
  );
}
