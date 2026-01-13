"use client";

import { useAdmin } from "@/context/AdminContext";
import {
  DollarSign,
  ShoppingBag,
  Package,
  CalendarDays,
} from "lucide-react";
import React from "react";

/* ---------------- TYPES ---------------- */

type StatColor = "emerald" | "cyan" | "violet" | "amber";

type StatItem = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: StatColor;
};

/* ---------------- COMPONENT ---------------- */

export default function AdminStats() {
  const { orders, products } = useAdmin();

  const totalOrders = orders.length;

  const totalRevenue = orders.reduce(
    (sum, o) => sum + o.total_price,
    0
  );

  // 📅 TODAY revenue
  const today = new Date().toLocaleDateString();

  const dailyRevenue = orders.reduce((sum, o) => {
    const orderDate = new Date(o.created_at).toLocaleDateString();
    return orderDate === today
      ? sum + o.total_price
      : sum;
  }, 0);

  const stats: StatItem[] = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: <ShoppingBag />,
      color: "emerald",
    },
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: <DollarSign />,
      color: "cyan",
    },
    {
      label: "Total Products",
      value: products.length,
      icon: <Package />,
      color: "violet",
    },
    {
      label: "Today Revenue",
      value: `$${dailyRevenue.toFixed(2)}`,
      icon: <CalendarDays />,
      color: "amber",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <StatCard key={i} {...s} />
      ))}
    </div>
  );
}

/* ---------------- STAT CARD ---------------- */

function StatCard({
  label,
  value,
  icon,
  color,
}: StatItem) {
  const colors: Record<StatColor, string> = {
    emerald:
      "from-emerald-500/20 to-emerald-500/5 text-emerald-400",
    cyan:
      "from-cyan-500/20 to-cyan-500/5 text-cyan-400",
    violet:
      "from-violet-500/20 to-violet-500/5 text-violet-400",
    amber:
      "from-amber-500/20 to-amber-500/5 text-amber-400",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-5 shadow-xl hover:scale-[1.02] transition">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors[color]} blur-2xl`}
      />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {label}
          </p>
          <p className="text-3xl font-bold text-white mt-1">
            {value}
          </p>
        </div>

        <div
          className={`p-3 rounded-xl bg-white/10 ${colors[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
