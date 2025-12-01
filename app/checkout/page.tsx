'use client';
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
    const sum = stored.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);
    setTotal(sum);
  }, []);

  const sendToWhatsApp = () => {
    if (cart.length === 0) return;
    const message = cart
      .map((item: any) => `• ${item.title} (x${item.qty}) = $${item.price * item.qty}`)
      .join("%0A");

    const fullMessage = `NEW ORDER:%0A${message}%0A%0ATOTAL: $${total}`;
    const phone = "YOUR_PHONE_NUMBER"; // Replace with your WhatsApp number

    window.open(`https://wa.me/${phone}?text=${fullMessage}`, "_blank");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item: any, index: number) => (
              <div key={index} className="border p-4 rounded-xl shadow-sm">
                <h2 className="font-semibold text-lg">{item.title}</h2>
                <p>Quantity: {item.qty}</p>
                <p>Price: ${item.price * item.qty}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 border rounded-xl bg-gray-100">
            <h2 className="text-xl font-bold">Total: ${total}</h2>
          </div>

          <Button className="w-full mt-4 p-4 text-lg" onClick={sendToWhatsApp}>
            Confirm & Send to WhatsApp
          </Button>
        </>
      )}
    </div>
  );
}