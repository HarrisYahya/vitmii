"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAdmin } from "@/context/AdminContext";
import { TrendingUp, ShoppingBag, DollarSign } from "lucide-react";

export default function RevenueChart() {
  const { orders } = useAdmin();

  const revenueByDate = orders.reduce((acc: any[], order) => {
    const date = new Date(order.created_at).toLocaleDateString();

    const found = acc.find((d) => d.date === date);
    if (found) {
      found.revenue += order.total_price;
      found.orders += 1;
    } else {
      acc.push({
        date,
        revenue: order.total_price,
        orders: 1,
      });
    }

    return acc;
  }, []);

  const totalRevenue = orders.reduce(
    (sum, o) => sum + o.total_price,
    0
  );

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-6 shadow-2xl">
      {/* subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 blur-3xl" />

      <div className="relative space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Revenue Analytics
            </h2>
            <p className="text-sm text-gray-400">
              Performance overview
            </p>
          </div>

          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">
              Live
            </span>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPI
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={<DollarSign />}
            accent="emerald"
          />
          <KPI
            title="Total Orders"
            value={orders.length}
            icon={<ShoppingBag />}
            accent="cyan"
          />
          <KPI
            title="Avg / Order"
            value={`$${(
              totalRevenue / (orders.length || 1)
            ).toFixed(2)}`}
            icon={<TrendingUp />}
            accent="violet"
          />
        </div>

        {/* CHART */}
        <div className="h-[300px] rounded-xl bg-white/5 backdrop-blur-md p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueByDate}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#333"
              />
              <XAxis
                dataKey="date"
                stroke="#aaa"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#aaa"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  borderRadius: "12px",
                  border: "1px solid #333",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#34d399"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ---------- KPI CARD ---------- */

function KPI({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent: "emerald" | "cyan" | "violet";
}) {
  const accents: any = {
    emerald: "text-emerald-400 bg-emerald-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    violet: "text-violet-400 bg-violet-500/10",
  };

  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-md p-4 hover:scale-[1.02] transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-white">
            {value}
          </p>
        </div>
        <div
          className={`p-3 rounded-lg ${accents[accent]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
