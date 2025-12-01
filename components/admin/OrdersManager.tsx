// components/admin/OrdersManager.tsx
"use client";

import { useAdmin } from "@/context/AdminContext";

export default function OrdersManager() {
  const { orders } = useAdmin();

  return (
    <div>
      <h2 className="text-2xl font-semibold">Orders</h2>

      <div className="space-y-3 mt-4">
        {orders.map((o) => (
          <div key={o.id} className="border p-3 rounded">
            <p className="font-bold">Order #{o.id}</p>
            <p>Total: ${o.total_price}</p>
            <p>Date: {o.created_at}</p>

            <div className="ml-3 mt-2">
              {o.items?.map((it: any, i: number) => (
                <p key={i}>
                  - {it.name} (${it.price}) × {it.qty}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
