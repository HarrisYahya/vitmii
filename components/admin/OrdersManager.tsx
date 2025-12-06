"use client";

import { useAdmin } from "@/context/AdminContext";

export default function OrdersManager() {
  const { orders } = useAdmin();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-6 rounded-2xl">
      {/* ✅ TITLE VISIBILITY FIX */}
      <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">
        Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          No orders yet.
        </p>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => (
            <div
              key={o.id}
              className="border rounded-2xl p-5 bg-white dark:bg-neutral-800 shadow-md text-black dark:text-white"
            >
              {/* ✅ HEADER */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                <p className="font-bold text-lg">
                  Order #{o.id}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(o.created_at).toLocaleString()}
                </p>
              </div>

              {/* ✅ CUSTOMER INFO */}
              <div className="grid sm:grid-cols-3 gap-3 mb-4 text-sm">
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-neutral-900">
                  <p className="font-semibold">Total</p>
                  <p>${o.total_price}</p>
                </div>

                <div className="p-3 rounded-lg bg-gray-100 dark:bg-neutral-900">
                  <p className="font-semibold">Phone</p>
                  <p>{o.customer_phone || "N/A"}</p>
                </div>

                <div className="p-3 rounded-lg bg-gray-100 dark:bg-neutral-900">
                  <p className="font-semibold">District</p>
                  <p>{o.district || "N/A"}</p>
                </div>
              </div>

              {/* ✅ ORDER ITEMS */}
              <div className="border-t pt-3">
                <p className="font-semibold mb-2">Items</p>

                <div className="space-y-1 text-sm">
                  {o.items?.map((it: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between bg-gray-50 dark:bg-neutral-900 px-3 py-2 rounded-md"
                    >
                      <span>
                        {it.title} × {it.qty}
                      </span>
                      <span>
                        ${(it.price * it.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
