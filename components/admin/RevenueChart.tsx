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
    <div className="w-full m-0 p-0 -mt-6 md:-mt-8">
      <div className="rounded-3xl bg-gradient-to-br from-neutral-900 to-black border border-white/10 shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="px-8 pt-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Revenue Analytics
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Real-time performance overview
              </p>
            </div>

            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              Live
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/10" />

        {/* CONTENT */}
        <div className="px-8 py-8 space-y-8">

          {/* KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <KPI
              title="Total Revenue"
              value={`$${totalRevenue.toFixed(2)}`}
              icon={<DollarSign />}
            />
            <KPI
              title="Total Orders"
              value={orders.length}
              icon={<ShoppingBag />}
            />
            <KPI
              title="Avg / Order"
              value={`$${(
                totalRevenue / (orders.length || 1)
              ).toFixed(2)}`}
              icon={<TrendingUp />}
            />
          </div>

          {/* CHART */}
          <div className="h-[320px] bg-white/5 rounded-2xl p-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByDate}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#aaa" />
                <YAxis stroke="#aaa" />
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
    </div>
  );
}

function KPI({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-neutral-900/80 to-black 
    backdrop-blur-xl rounded-3xl 
    p-6 
    shadow-[0_0_40px_rgba(0,255,200,0.08)] 
    border border-white/10 
    w-full flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className="p-3 bg-white/10 rounded-xl text-emerald-400">
        {icon}
      </div>
    </div>
  );
}