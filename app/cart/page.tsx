"use client";

import Header from "@/components/layout/Header";
import { useCart } from "@/lib/cart-store";
import SafeImage from "@/components/SafeImage";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, increaseQty, decreaseQty, removeItem } = useCart();
  const router = useRouter();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function goToCheckout() {
    if (items.length === 0) return;
    router.push("/checkout");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <Header />

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-lg">
            Your cart is empty.
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-5 p-5 border rounded-2xl bg-white dark:bg-neutral-800 shadow-sm"
                >
                  {item.image && (
                    <SafeImage
                      src={item.image}
                      width={90}
                      height={90}
                      alt={item.name}
                    />
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-neutral-500">
                      ${item.price} / {item.unit}
                    </p>

                    <div className="flex items-center mt-4 gap-4">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="p-2 rounded-full border bg-neutral-100 hover:bg-neutral-200"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="font-semibold text-lg">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQty(item.id)}
                        className="p-2 rounded-full border bg-neutral-100 hover:bg-neutral-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-3 p-2 text-red-500 hover:bg-red-100 rounded-full"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 rounded-2xl bg-white dark:bg-neutral-800 border shadow-sm">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button
                onClick={goToCheckout}
                className="w-full mt-5 bg-green-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
