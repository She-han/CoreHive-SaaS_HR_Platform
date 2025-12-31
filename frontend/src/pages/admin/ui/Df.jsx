import React, { memo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  UserPlus,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Star,
} from "lucide-react";

const ModuleUsageChart = memo(() => {
  const moduleData = [
    { name: "Employee", value: 108, color: "#8884d8" },
    { name: "Payroll", value: 95, color: "#82ca9d" },
    { name: "Leave", value: 102, color: "#ffc658" },
    { name: "Attendance", value: 87, color: "#ff7300" },
    { name: "Performance", value: 64, color: "#0088fe" },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>{payload[0].name}</p>
          <p style={{ margin: "5px 0 0 0", color: "#666" }}>
            Subscriptions: <strong>{payload[0].value}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        paddingLeft: "30px",
        paddingRight: "30px",
        borderRadius: "16px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        border: "1px solid #f3f4f6",
        height: "100%",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}
      >
       
        <h3 className="text-xl font-bold text-gray-800 mb-4">Module Usage by Tenants</h3>
      </div>
      <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
        Active module subscriptions
      </p>

      <div style={{ display: "flex", height: "300px" }}>
        <div style={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={moduleData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {moduleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: "#666", fontSize: "14px" }}>
                    {value}: {moduleData.find((m) => m.name === value)?.value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, paddingLeft: "20px", paddingBottom: "20px", margin: "1px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h4
              style={{ marginBottom: "15px", color: "#333", fontSize: "14px" }}
            >
              Module Details
            </h4>
            {moduleData.map((module, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "2px",
                      backgroundColor: module.color,
                      marginRight: "10px",
                    }}
                  />
                  <span style={{ color: "#333" }}>{module.name}</span>
                </div>
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {module.value}
                </span>
              </div>
            ))}
          </div>

          
        </div>
      </div>
    </div>
  );
});

ModuleUsageChart.displayName = 'ModuleUsageChart';

export default ModuleUsageChart;
