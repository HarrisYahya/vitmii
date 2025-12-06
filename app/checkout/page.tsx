"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/lib/cart-store";

const districts = [
  "Abdiaziz","Bondhere","Daynile","Dharkenley","Hamar Jajab","Hamar Weyne",
  "Hodan","Howlwadaag","Kahda","Karaan","Shangani","Shibis",
  "Waberi","Wadajir","Wardhiigley","Yaqshid",
];

export default function CheckoutPage() {
  const { items, clearCart } = useCart();

  // ✅ hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [infoSubmitted, setInfoSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!mounted) return null; // ✅ prevents invisible render bug

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function submitCustomerInfo() {
    if (!phone || !district) {
      alert("Please enter phone and district.");
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setInfoSubmitted(true);
    setShowConfirm(true);
  }

  async function confirmOrderAndSend() {
    try {
      setLoading(true);

      const formattedItems = items.map((item) => ({
        id: item.id,
        title: item.name,
        price: item.price,
        qty: item.quantity,
      }));

      await supabase.from("orders").insert([
        {
          total_price: total,
          customer_phone: phone,
          district,
          items: formattedItems,
        },
      ]);

      const message = formattedItems
        .map(
          (item) =>
            `• ${item.title} × ${item.qty} = $${(
              item.price * item.qty
            ).toFixed(2)}`
        )
        .join("%0A");

      const finalMessage =
        `NEW ORDER:%0A${message}%0A%0ATotal: $${total.toFixed(
          2
        )}%0APhone: ${phone}%0ADistrict: ${district}`;

      window.open(
        `https://wa.me/252617733690?text=${finalMessage}`,
        "_blank"
      );

      clearCart();
      setPhone("");
      setDistrict("");
      setInfoSubmitted(false);
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 py-10 px-4">
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-md border">

        {/* ✅ TITLE VISIBILITY FIX */}
        <h1 className="text-3xl font-bold mb-8 text-center text-black dark:text-white">
          Checkout
        </h1>

        {/* ✅ EMPTY CART VISIBILITY FIX */}
        {items.length === 0 ? (
          <p className="text-center text-lg text-gray-600 dark:text-gray-300">
            Your cart is empty.
          </p>
        ) : (
          <>
            {/* ✅ CUSTOMER INFO FORM */}
            {!infoSubmitted && (
              <div className="space-y-4 mb-8">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full border p-4 rounded-xl bg-white text-black dark:bg-neutral-900 dark:text-white"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <select
                  className="w-full border p-4 rounded-xl bg-white text-black dark:bg-neutral-900 dark:text-white"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="">Select District</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <Button className="w-full" onClick={submitCustomerInfo}>
                  Submit Info
                </Button>
              </div>
            )}

            {/* ✅ SUBMITTED INFO */}
            {infoSubmitted && (
              <div className="mb-6 p-5 rounded-xl border bg-gray-50 dark:bg-neutral-900 text-black dark:text-white">
                <p><b>Phone:</b> {phone}</p>
                <p><b>District:</b> {district}</p>

                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setInfoSubmitted(false);
                    setShowConfirm(false);
                  }}
                >
                  Edit Info
                </Button>
              </div>
            )}

            {/* ✅ ORDER ITEMS */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between p-3 border rounded-lg bg-white dark:bg-neutral-900 text-black dark:text-white"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* ✅ TOTAL */}
            <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-neutral-900 text-xl font-bold flex justify-between text-black dark:text-white">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </>
        )}

        {/* ✅ CONFIRMATION MODAL */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl w-full max-w-md space-y-4 text-black dark:text-white">
              <h2 className="text-xl font-bold">Confirm Order</h2>

              <p><b>Phone:</b> {phone}</p>
              <p><b>District:</b> {district}</p>
              <p><b>Total:</b> ${total.toFixed(2)}</p>

              <div className="flex gap-3 pt-2">
                <Button
                  className="w-full"
                  disabled={loading}
                  onClick={confirmOrderAndSend}
                >
                  {loading ? "Processing..." : "Confirm & WhatsApp"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
