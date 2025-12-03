 "use client";

import Header from "@/components/layout/Header";
import { useCart } from "@/lib/cart-store";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, increaseQty, decreaseQty, removeItem } = useCart();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ✅ WhatsApp checkout function (ADDED ONLY THIS)
  function sendToWhatsApp() {
    if (items.length === 0) return;

    const phone = "252617733690";

    const message = items
      .map(
        (item) =>
          `• ${item.name} x ${item.quantity} = $${(
            item.price * item.quantity
          ).toFixed(2)}`
      )
      .join("%0A");

    const totalFormatted = total.toFixed(2);

    const finalMessage =
      `NEW ORDER:%0A-----------------%0A${message}%0A-----------------%0ATotal: $${totalFormatted}`;

    const url = `https://wa.me/${phone}?text=${finalMessage}`;

    window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <Header />

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Your Cart</h1>

        {items.length === 0 ? (
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Your cart is empty.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border rounded-2xl bg-white dark:bg-neutral-800 shadow-md"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      width={80}
                      height={80}
                      alt={item.name}
                      className="rounded-xl object-cover"
                    />
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      ${item.price} / {item.unit}
                    </p>

                    <div className="flex items-center mt-3 gap-3">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="p-2 rounded-full border bg-neutral-100 dark:bg-neutral-700"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="font-semibold">{item.quantity}</span>

                      <button
                        onClick={() => increaseQty(item.id)}
                        className="p-2 rounded-full border bg-neutral-100 dark:bg-neutral-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-2 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-neutral-800 border shadow-md">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* ✅ Checkout button now sends WhatsApp message */}
              <button
                onClick={sendToWhatsApp}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-green-700 transition"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
