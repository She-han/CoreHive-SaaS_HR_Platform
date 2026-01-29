import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const HeadcountTrendChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("corehive_token");

    // නිවැරදි URL එක: /api/employees/statistics/headcount-trend
    axios
      .get("http://localhost:8080/api/employees/statistics/headcount-trend", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          const formattedData = res.data.map((item) => ({
            ...item,
            count: Number(item.count),
          }));
          setData(formattedData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching headcount trend:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#0C397A]">Headcount Trend</h3>
        <p className="text-sm text-gray-400">Employee growth over time</p>
      </div>

      <div className="h-[300px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 italic">
            Loading Chart Data...
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No growth data found
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#02C39A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#02C39A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F0F0F0"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9B9B9B", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9B9B9B", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#02C39A"
                fillOpacity={1}
                fill="url(#colorCount)"
                strokeWidth={3}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default HeadcountTrendChart;
