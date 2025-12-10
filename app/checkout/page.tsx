"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/lib/cart-store";

const districts = [
  "Abdiaziz","Bondhere","Daynile","Dharkenley","Hamar Jajab","Hamar Weyne",
  "Hodan","Howlwadaag","Kahda","Karaan","Shangani","Shibis",
  "Waberi","Wadajir","Wardhiigley","Yaqshid","Huriwaa","Heliwaa",
];

// DELIVERY FEES BY DISTRICT
const deliveryPrices: Record<string, number> = {
  "Abdiaziz": 2,
  "Bondhere": 1.5,
  "Daynile": 1.5,
  "Dharkenley": 1.5,
  "Hamar Jajab": 1.5,
  "Hamar Weyne": 1.5,
  "Hodan": 2,
  "Howlwadaag": 1,
  "Kahda": 1.5,
  "Karaan": 2,
  "Shangani": 2,
  "Shibis": 2,
  "Waberi": 1,
  "Wadajir": 1.5,
  "Wardhiigley": 1.5,
  "Yaqshid": 2,
  "Huriwaa": 2,
  "Heliwaa": 2,
};

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [delivery, setDelivery] = useState(false);
  const [infoSubmitted, setInfoSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!mounted) return null;

  // SUBTOTAL
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // DELIVERY FEE
  const deliveryFee = delivery ? (deliveryPrices[district] || 0) : 0;

  // FINAL TOTAL
  const total = subtotal + deliveryFee;

  function submitCustomerInfo() {
    if (!phone || !district) {
      alert("Please enter phone and district.");
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // DELIVERY MINIMUM CHECK
    if (delivery && subtotal < 5) {
      alert("Delivery requires a minimum order of $5.");
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
          delivery,
          delivery_fee: deliveryFee,
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
        `🛒 *Waxaan Rabaa Adeegaas*%0A` +
        `——————————————%0A` +
        `🚚 *Delivery:* ${delivery ? "Haa" : "Maya"}%0A` +
        `📍 *Degmada:* ${district}%0A` +
        `📞 *Phone:* ${phone}%0A%0A` +
        `*Items:*%0A${message}%0A%0A` +
        `🚚 *Delivery Fee:* $${deliveryFee.toFixed(2)}%0A` +
        `💰 *Total:* $${total.toFixed(2)}%0A` +
        `📩 Macamiil lacagta ku so dir 617733690`;

      // iPhone-safe redirect
      window.location.href = `https://wa.me/252617733690?text=${finalMessage}`;

      clearCart();
      setPhone("");
      setDistrict("");
      setDelivery(false);
      setInfoSubmitted(false);
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 pb-10">

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b p-4">
        <h1 className="text-2xl font-bold text-center text-black dark:text-white">
          Checkout
        </h1>
      </div>

      <div className="max-w-3xl mx-auto p-6 rounded-2xl shadow-md border mt-6 bg-white dark:bg-neutral-800">

        {items.length === 0 ? (
          <p className="text-center text-lg text-gray-600 dark:text-gray-300">
            Your cart is empty.
          </p>
        ) : (
          <>
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

                {/* DELIVERY TOGGLE */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={delivery}
                    onChange={(e) => setDelivery(e.target.checked)}
                  />
                  <span className="text-black dark:text-white">
                    Delivery (min $5 order)
                  </span>
                </div>

                <Button className="w-full" onClick={submitCustomerInfo}>
                  Submit Info
                </Button>
              </div>
            )}

            {infoSubmitted && (
              <div className="mb-6 p-5 rounded-xl border bg-gray-50 dark:bg-neutral-900 text-black dark:text-white">
                <p><b>Phone:</b> {phone}</p>
                <p><b>District:</b> {district}</p>
                <p><b>Delivery:</b> {delivery ? "Yes" : "No"}</p>
                <p><b>Delivery Fee:</b> ${deliveryFee.toFixed(2)}</p>

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

            <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-neutral-900 text-black dark:text-white">
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-lg mt-2">
                <span>Delivery Fee:</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xl font-bold mt-4">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl w-full max-w-md space-y-4 text-black dark:text-white">
              <h2 className="text-xl font-bold">Confirm Order</h2>

              <p><b>Phone:</b> {phone}</p>
              <p><b>District:</b> {district}</p>
              <p><b>Delivery:</b> {delivery ? "Yes" : "No"}</p>
              <p><b>Delivery Fee:</b> ${deliveryFee.toFixed(2)}</p>
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
