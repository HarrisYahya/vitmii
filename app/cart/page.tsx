"use client";

import Header from "@/components/layout/Header";
import { useCart } from "@/lib/cart-store";

export default function CartPage() {
  const { items } = useCart();

  return (
    <div className="min-h-screen">
      <Header />

      <div className="p-6">
        <h1 className="text-3xl font-semibold mb-4">Your Cart</h1>

        {items.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item, i) => (
              <div
                key={i}
                className="border p-4 rounded-lg bg-white dark:bg-neutral-800"
              >
                <h3 className="font-semibold">{item.name}</h3>
                <p>${item.price} {item.unit}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
