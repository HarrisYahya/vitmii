"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/products";
import { useCart } from "@/lib/cart-store";

export default function ProductGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      const data = await getProducts();
      setProducts(data);
    }
    load();
  }, []);

  return (
    <section className="px-4 pb-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <Card
          key={p.id}
          className="rounded-2xl bg-[#1C1C1E] border border-gray-800 shadow-lg overflow-hidden"
        >
          <CardContent className="p-0">
            {/* Product image */}
            <img
              src={p.image}
              className="w-full h-32 object-cover rounded-t-2xl"
            />

            {/* Product info */}
            <div className="p-3 flex flex-col items-center text-center">
              <h3 className="font-semibold text-white text-[15px]">{p.name}</h3>

              <p className="text-gray-300 text-sm mt-1">
                ${p.price} {p.unit}
              </p>

              {/* Add Cart Button */}
              <Button
                className="mt-3 w-full bg-blue-600 text-white rounded-xl py-2 text-sm hover:bg-blue-700"
                onClick={() => addItem(p)}
              >
                Add Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}