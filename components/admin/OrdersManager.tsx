"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { supabase } from "@/lib/supabase";

export default function OrdersManager() {
  const { orders, refresh } = useAdmin();

  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) =>
    `${o.customer_phone ?? ""} ${o.district ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

    async function updateStatus(
  id: string,
  status: "processing" | "delivered"
) {
  try {
    setLoadingId(id);

    const { error } = await supabase
      .from("orders")
      .update({
        status,
        read: true,
      })
      .eq("id", id);

    if (error) {
      console.error("Update failed:", error.message);
      alert("Failed to update order.");
      return;
    }

    await refresh(); // reload admin data
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingId(null);
  }
}
  function handlePrint() {
  window.print();
}

  return (
  <div className="space-y-10">

    {/* HEADER */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h2 className="text-3xl font-semibold text-white">
        Orders
      </h2>

      <input
        placeholder="Search by phone or district..."
        className="bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 rounded-xl px-4 py-2 w-full sm:w-80 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    {/* ORDER LIST */}
     {/* ORDER LIST */}
<div className="space-y-2">
  {filteredOrders.map((o) => (
    <div
      key={o.id}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm
      ${
        !o.read
          ? "border-emerald-500 bg-neutral-900"
          : "border-neutral-800 bg-neutral-900"
      }`}
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-6 flex-wrap">

        <span className="font-semibold text-white w-24">
          ${o.total_price.toFixed(2)}
        </span>

        <span className="text-neutral-400 w-40 truncate">
          {o.customer_phone || "N/A"}
        </span>

        <span className="text-neutral-500 w-40 truncate">
          {o.district || "N/A"}
        </span>

        <span className="text-neutral-500 w-20">
          {Array.isArray(o.items) ? o.items.length : 0} items
        </span>

       <span
  className={`text-xs font-medium px-2 py-1 rounded-full
    ${
      o.status === "pending"
        ? "bg-yellow-500/20 text-yellow-400"
        : o.status === "processing"
        ? "bg-blue-500/20 text-blue-400"
        : o.status === "delivered"
        ? "bg-emerald-500/20 text-emerald-400"
        : "bg-red-500/20 text-red-400"
    }
  `}
>
  {o.status || "pending"}
</span>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedOrder(o)}
          className="bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg px-3 py-1.5 text-xs transition"
        >
          View
        </button>

      <div className="flex gap-2">
  <button
    onClick={() => updateStatus(o.id, "processing")}
    disabled={loadingId === o.id || o.status === "processing" || o.status === "delivered"}
    className={`rounded-lg px-3 py-1.5 text-xs text-white transition
      ${
        o.status === "processing"
          ? "bg-blue-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }
    `}
  >
    {o.status === "processing" ? "Processing ✓" : "Processing"}
  </button>

  <button
    onClick={() => updateStatus(o.id, "delivered")}
    disabled={loadingId === o.id || o.status === "delivered"}
    className={`rounded-lg px-3 py-1.5 text-xs text-white transition
      ${
        o.status === "delivered"
          ? "bg-emerald-400 cursor-not-allowed"
          : "bg-emerald-600 hover:bg-emerald-700"
      }
    `}
  >
    {o.status === "delivered" ? "Delivered ✓" : "Delivered"}
  </button>
</div>
      </div>
    </div>
  ))}
</div>

    {/* MODAL */}
  {selectedOrder && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

     <div id="printable-invoice" className="bg-neutral-900 print:bg-white print:text-black border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl print:shadow-none">

      {/* HEADER */}
      <div className="px-8 py-6 border-b border-neutral-800 print:border-gray-300">

        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white print:text-black">
              INVOICE
            </h2>
            <p className="text-sm text-neutral-400 print:text-gray-600 mt-1">
              Invoice #: {selectedOrder.id.slice(0, 8)}
            </p>
            <p className="text-sm text-neutral-400 print:text-gray-600">
              Date: {new Date(selectedOrder.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="text-right">
            <h3 className="text-lg font-semibold text-white print:text-black">
              VITIMIIN ONLINE
            </h3>
            <p className="text-sm text-neutral-400 print:text-gray-600">
              Mogadishu, Somalia
            </p>
          </div>
        </div>

      </div>

      {/* BODY */}
      <div className="px-8 py-6 overflow-y-auto space-y-8">

        {/* BILL TO */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-400 print:text-gray-600 mb-2">
            BILL TO
          </h4>

          <div className="text-white print:text-black space-y-1">
            <p>{selectedOrder.customer_phone || "N/A"}</p>
            <p>{selectedOrder.district || "N/A"}</p>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 print:border-gray-300 text-left">
                <th className="py-3 text-neutral-400 print:text-gray-600">Item</th>
                <th className="py-3 text-neutral-400 print:text-gray-600">Qty</th>
                <th className="py-3 text-neutral-400 print:text-gray-600">Price</th>
                <th className="py-3 text-right text-neutral-400 print:text-gray-600">Total</th>
              </tr>
            </thead>

            <tbody>
              {(selectedOrder.items || []).map((it: any, i: number) => (
                <tr
                  key={i}
                  className="border-b border-neutral-800 print:border-gray-200"
                >
                  <td className="py-4 text-white print:text-black">
                    {it.title}
                  </td>

                  <td className="py-4 text-white print:text-black">
                    {it.qty}
                  </td>

                  <td className="py-4 text-white print:text-black">
                    ${it.price.toFixed(2)}
                  </td>

                  <td className="py-4 text-right text-white print:text-black font-medium">
                    ${(it.price * it.qty).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTAL SECTION */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3">

            <div className="flex justify-between text-neutral-400 print:text-gray-600">
              <span>Subtotal</span>
              <span>${selectedOrder.total_price.toFixed(2)}</span>
            </div>

            <div className="border-t border-neutral-800 print:border-gray-300 pt-3 flex justify-between text-lg font-bold text-white print:text-black">
              <span>Total</span>
              <span>${selectedOrder.total_price.toFixed(2)}</span>
            </div>

          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="px-8 py-4 border-t border-neutral-800 print:hidden flex justify-between items-center">

        <span className={`text-sm font-medium ${
          selectedOrder.read
            ? "text-neutral-400"
            : "text-emerald-400"
        }`}>
          {selectedOrder.read ? "Processed" : "New Order"}
        </span>

        <div className="flex gap-3">
          <button
            onClick={() => setSelectedOrder(null)}
            className="bg-neutral-800 hover:bg-neutral-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            🖨 Print Invoice
          </button>
        </div>

      </div>

    </div>
  </div>
)}
  </div>
);
}