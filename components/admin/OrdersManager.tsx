"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { supabase } from "@/lib/supabase";

type OrderItem = {
  title: string;
  qty: number;
  price: number;
};

export default function OrdersManager() {
  const { orders, refresh } = useAdmin();

  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------
  const filteredOrders = orders.filter((o) =>
    `${o.customer_phone ?? ""} ${o.district ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // --------------------------------------------------
  // MARK AS READ
  // --------------------------------------------------
  async function markAsRead(id: string) {
    setLoadingId(id);
    await supabase.from("orders").update({ read: true }).eq("id", id);
    await refresh();
    setLoadingId(null);
  }

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold">Orders</h2>

        <input
          placeholder="Search by phone or district..."
          className="border rounded-lg px-4 py-2 w-full sm:w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50 text-left text-sm">
            <tr>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">District</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredOrders.map((o) => (
              <tr
                key={o.id}
                className={`hover:bg-gray-50 ${
                  !o.read ? "bg-green-50 font-semibold" : ""
                }`}
              >
                <td className="px-5 py-3">
                  {!o.read ? (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                      NEW
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                      Read
                    </span>
                  )}
                </td>

                <td className="px-5 py-3">{o.customer_phone || "—"}</td>
                <td className="px-5 py-3">{o.district || "—"}</td>
                <td className="px-5 py-3">{Array.isArray(o.items) ? o.items.length : 0}</td>
                <td className="px-5 py-3">${o.total_price.toFixed(2)}</td>
                <td className="px-5 py-3">
                  {new Date(o.created_at).toLocaleString()}
                </td>

                <td className="px-5 py-3 flex gap-2">
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                  >
                    View
                  </button>

                  {!o.read && (
                    <button
                      onClick={() => markAsRead(o.id)}
                      disabled={loadingId === o.id}
                      className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                    >
                      {loadingId === o.id ? "..." : "Mark Read"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="grid gap-4 md:hidden">
        {filteredOrders.map((o) => (
          <div
            key={o.id}
            className={`rounded-2xl p-4 shadow bg-white ${
              !o.read ? "border-l-4 border-green-600" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold">
                ${o.total_price.toFixed(2)}
              </p>
              {!o.read && (
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                  NEW
                </span>
              )}
            </div>

            <p className="text-sm mt-1">📞 {o.customer_phone || "N/A"}</p>
            <p className="text-sm">📍 {o.district || "N/A"}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(o.created_at).toLocaleString()}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setSelectedOrder(o)}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm"
              >
                View
              </button>

              {!o.read && (
                <button
                  onClick={() => markAsRead(o.id)}
                  className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm"
                >
                  Mark Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ================= VIEW MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-4 text-xl"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold mb-3">
              Order #{selectedOrder.id}
            </h3>

            <div className="space-y-2 text-sm">
              <p>📞 {selectedOrder.customer_phone || "N/A"}</p>
              <p>📍 {selectedOrder.district || "N/A"}</p>
              <p>🕒 {new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>

            <div className="mt-4 border-t pt-3 space-y-2">
              {(Array.isArray(selectedOrder.items)
                ? selectedOrder.items
                : []
              ).map((it: OrderItem, i: number) => (
                <div
                  key={i}
                  className="flex justify-between bg-gray-100 rounded px-3 py-2 text-sm"
                >
                  <span>
                    {it.title} × {it.qty}
                  </span>
                  <span>${(it.price * it.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 font-semibold text-right">
              Total: ${selectedOrder.total_price.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
