"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/lib/types";

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      const data = await getProducts();
      setProducts(data);
    }
    load();
  }, []);

  return (
    <section className="px-8 pb-10 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {products.map((p) => (
        <Card
          key={p.id}
          className="shadow-md rounded-xl overflow-hidden border h-[200px] w-[140px] flex flex-col"
        >
          <CardContent className="p-0 flex flex-col flex-1">
            <img
              src={p.image}
              className="w-full h-20 object-cover"
            />

            <div className="px-3 py-2 flex flex-col flex-1 items-center text-center justify-between">
              <div>
                <h3 className="font-medium text-sm leading-tight truncate">
                  {p.name}
                </h3>
                <p className="text-gray-600 text-xs mt-1">
                  ${p.price} {p.unit}
                </p>
              </div>

              <Button
                className="w-full bg-blue-600 text-white hover:bg-blue-700 text-xs py-1 mt-2"
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
