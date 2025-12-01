// components/home/ProductCard.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);

  return (
    <Card className="shadow-md rounded-xl overflow-hidden">
      <CardContent className="p-0">
        <img src={product.image} className="w-full h-32 object-cover" />
        <div className="p-4 flex flex-col items-center text-center">
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-gray-600 text-sm">
            ${product.price} {product.unit}
          </p>

          <Button
            className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => addItem(product)}
          >
            Add Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
