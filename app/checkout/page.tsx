"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/lib/cart-store";

// District list
const districts = [
  "Abdiaziz","Bondhere","Daynile","Dharkenley","Hamar Jajab","Hamar Weyne",
  "Hodan","Howlwadaag","Kahda","Karaan","Shangani","Shibis",
  "Waberi","Wadajir","Wardhiigley","Yaqshid","Huriwaa","Heliwaa",
];

// DELIVERY FEES BY DISTRICT
const deliveryPrices: Record<string, number> = {
  Abdiaziz: 2,
  Bondhere: 1.5,
  Daynile: 1.5,
  Dharkenley: 1.5,
  "Hamar Jajab": 1.5,
  "Hamar Weyne": 1.5,
  Hodan: 2,
  Howlwadaag: 1,
  Kahda: 1.5,
  Karaan: 2,
  Shangani: 2,
  Shibis: 2,
  Waberi: 1,
  Wadajir: 1.5,
  Wardhiigley: 1.5,
  Yaqshid: 2,
  Huriwaa: 2,
  Heliwaa: 2,
};

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
};

/* =========================
   SAFE PHONE NORMALIZER
========================= */
function normalizeSomaliPhone(input: string) {
  let p = input.replace(/\D/g, "");

  if (p.startsWith("0")) p = "252" + p.slice(1);
  if (p.startsWith("252252")) p = p.slice(3);

  return p;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [delivery, setDelivery] = useState(false);
  const [infoSubmitted, setInfoSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toast states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = delivery ? deliveryPrices[district] || 0 : 0;
  const total = subtotal + deliveryFee;

  function submitCustomerInfo() {
    if (!phone || !district) {
      setErrorMessage("Please enter phone and district.");
      return;
    }
    if (items.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }
    if (delivery && subtotal < 5) {
      setErrorMessage("Delivery requires a minimum order of $5.");
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

      // Save order to Supabase
      const { error } = await supabase.from("orders").insert([
        {
          total_price: total,
          customer_phone: phone,
          district,
          delivery,
          delivery_fee: deliveryFee,
          items: formattedItems,
        },
      ]);

      if (error) {
        setErrorMessage("Failed to save order. Please try again.");
        return;
      }

      // Call WaafiPay backend (PHONE NORMALIZED HERE ✅)
      const res = await fetch(
        "https://waafipay-backend-production.up.railway.app/waafipay/confirm",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: normalizeSomaliPhone(phone),
            total,
            district,
            delivery,
            deliveryFee,
            items: formattedItems,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("WaafiPay API failed:", res.status, text);
        setErrorMessage("Payment failed. Please try again.");
        return;
      }

      const dataWaafi = await res.json();

      if (dataWaafi.status !== "SUCCESS") {
        console.error("WaafiPay response error:", dataWaafi);
        setErrorMessage("Payment failed. Please try again.");
        return;
      }

      // Success
      setSuccessMessage("Payment successful ✔");

      clearCart();
      setPhone("");
      setDistrict("");
      setDelivery(false);
      setInfoSubmitted(false);
      setShowConfirm(false);

    } catch (err) {
      console.error("Unexpected error:", err);
      setErrorMessage("Something went wrong. Please try again.");
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
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
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
                  {loading ? "Processing..." : "Confirm & Pay"}
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

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-5 right-5 z-50 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg">
          <div className="flex justify-between items-center gap-4">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg">
          <div className="flex justify-between items-center gap-4">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}