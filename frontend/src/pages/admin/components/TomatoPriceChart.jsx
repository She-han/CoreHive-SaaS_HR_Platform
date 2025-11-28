import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", tenants: 45 },
  { month: "Feb", tenants: 52 },
  { month: "Mar", tenants: 68 },
  { month: "Apr", tenants: 85 },
  { month: "May", tenants: 95 },
  { month: "Jun", tenants: 78 },
];

export default function TomatoPriceChart() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        tenants growth - Last 6 Months
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
            
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="tenants"
            stroke="#10b981"
            fill="#6ee7b7"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
