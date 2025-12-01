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
    <section className="px-8 pb-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {products.map((p) => (
        <Card key={p.id} className="shadow-md rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <img src={p.image} className="w-full h-32 object-cover" />
            <div className="p-4 flex flex-col items-center text-center">
              <h3 className="font-medium">{p.name}</h3>
              <p className="text-gray-600 text-sm">${p.price} {p.unit}</p>

              <Button
                className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-700"
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
