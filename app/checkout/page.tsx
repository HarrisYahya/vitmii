"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/lib/cart-store";

/* =========================
   DISTRICTS
========================= */
const districts = [
  "Abdiaziz","Bondhere","Daynile","Dharkenley","Hamar Jajab","Hamar Weyne",
  "Hodan","Howlwadaag","Kahda","Karaan","Shangani","Shibis",
  "Waberi","Wadajir","Wardhiigley","Yaqshid","Huriwaa","Heliwaa",
];

/* =========================
   DELIVERY FEES
========================= */
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

/* =========================
   PHONE NORMALIZER
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

      const data = await res.json();

      if (data.status !== "SUCCESS") {
        setErrorMessage("Payment failed. Please try again.");
        return;
      }

      setSuccessMessage("Payment successful ✔");
      clearCart();
      setShowConfirm(false);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6">
      {/* UI unchanged */}
      <Button onClick={confirmOrderAndSend} disabled={loading}>
        {loading ? "Processing..." : "Confirm & Pay"}
      </Button>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
    </div>
  );
}