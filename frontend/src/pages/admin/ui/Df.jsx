import React from "react";
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

const ModuleUsageChart = () => {
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
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        height: "100%",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}
      >
       
        <h3 className="text-xl font-bold text-gray-800 mb-4">Module Usage by Tenants</h3>
      </div>
      <p style={{ marginBottom: '20px', color: '#666' }}>
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
};

const PendingTenantRequests = () => {
  const requests = [
    {
      company: "TechStart Inc.",
      type: "New Registration",
      date: "2025-11-07",
      status: "pending",
      icon: <AlertCircle size={16} />,
    },
    {
      company: "Global Solutions",
      type: "Module Upgrade",
      date: "2025-11-06",
      status: "premium",
      icon: <Star size={16} />,
    },
    {
      company: "Innovation Labs",
      type: "User Limit Increase",
      date: "2025-11-06",
      status: "review",
      icon: <Clock size={16} />,
    },
    {
      company: "Digital Dynamics",
      type: "New Registration",
      date: "2025-11-05",
      status: "pending",
      icon: <AlertCircle size={16} />,
    },
  ];

  const getStatusStyles = (status) => {
    switch (status) {
      case "pending":
        return { backgroundColor: "#fef3c7", color: "#92400e" };
      case "premium":
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case "review":
        return { backgroundColor: "#f3e8ff", color: "#5b21b6" };
      default:
        return { backgroundColor: "#f1f5f9", color: "#64748b" };
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        height: "100%",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}
      >
        <Clock size={20} style={{ marginRight: "10px", color: "#4f46e5" }} />
        <h3 style={{ margin: 0, color: "#333" }}>Pending Tenant Requests</h3>
      </div>
      <p style={{ marginBottom: "25px", color: "#666" }}>
        Requests requiring approval
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {requests.map((request, index) => (
          <div
            key={index}
            style={{
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              transition: "all 0.2s",
              cursor: "pointer",
              ":hover": {
                borderColor: "#4f46e5",
                boxShadow: "0 2px 8px rgba(79, 70, 229, 0.1)",
              },
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  {request.icon}
                  <h4
                    style={{
                      margin: "0 0 0 8px",
                      fontSize: "16px",
                      color: "#333",
                    }}
                  >
                    {request.company}
                  </h4>
                </div>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  {request.type}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#94a3b8",
                  }}
                >
                  {request.date}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    textTransform: "capitalize",
                    ...getStatusStyles(request.status),
                  }}
                >
                  {request.status}
                </span>
                <button
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    ":hover": {
                      backgroundColor: "#4338ca",
                    },
                  }}
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "20px",
          paddingTop: "15px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
          <strong>{requests.length}</strong> requests pending review
        </p>
        <button
          style={{
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "#4f46e5",
            border: "1px solid #4f46e5",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s",
            ":hover": {
              backgroundColor: "#4f46e5",
              color: "white",
            },
          }}
        >
          View All Requests
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div
      style={{
        margin: "0 auto",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <div>
        <div className="mb-10">
          <ModuleUsageChart />
        </div>

        <PendingTenantRequests />
      </div>
    </div>
  );
};

export default Dashboard;
