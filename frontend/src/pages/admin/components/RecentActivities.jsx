import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Search,
  Download,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

const THEME = {
  primary: "#02C39A",
  secondary: "#05668D",
  dark: "#0C397A",
  background: "#F1FDF9",
  success: "#1ED292",
  text: "#333333",
  muted: "#9B9B9B",
};

const RecentActivities = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("corehive_token");

  const totalEvents = logs.length;
  const criticalEvents = logs.filter(
    (log) => log.severity?.toLowerCase() === "critical"
  ).length;
  const warnings = logs.filter(
    (log) => log.severity?.toLowerCase() === "warning"
  ).length;
  const today = new Date().toISOString().split("T")[0];
  const todaysEvents = logs.filter((log) =>
    log.timestamp?.startsWith(today)
  ).length;

  const StatCard = ({ stat }) => {
    const Icon = stat.icon;
    return (
      <div
        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-opacity-50 relative overflow-hidden flex-1 min-w-[240px]"
        style={{
          borderColor: stat.borderColor,
          background: `linear-gradient(135deg, white 0%, ${stat.bgLight} 100%)`,
        }}
      >
        {/* Background decoration bubble */}
        <div
          className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: stat.iconColor }}
        />

        <div className="flex items-center gap-4 relative z-10">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300"
            style={{
              background: `linear-gradient(135deg, ${stat.iconColor} 0%, ${stat.iconColorDark} 100%)`,
            }}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: THEME.muted }}
            >
              {stat.title}
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: THEME.dark }}
            >
              {stat.value}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {stat.changeType === "positive" ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
              <p
                className={`text-xs font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              >
                {stat.subtitle}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
      </div>
    );
  };

  const statCardsData = useMemo(
    () => [
      {
        title: "Total Events",
        value: totalEvents.toLocaleString(),
        subtitle: "Last 7 days",
        icon: ShieldCheck,
        iconColor: THEME.secondary,
        iconColorDark: THEME.dark,
        bgLight: "#EBF8FF",
        borderColor: THEME.secondary,
        changeType: "positive",
      },
      {
        title: "Critical Events",
        value: criticalEvents.toLocaleString(),
        subtitle: "Requires attention",
        icon: AlertCircle,
        iconColor: "#EF4444", // Red
        iconColorDark: "#B91C1C",
        bgLight: "#FEF2F2",
        borderColor: "#EF4444",
        changeType: criticalEvents > 0 ? "warning" : "positive",
      },
      {
        title: "Warnings",
        value: warnings.toLocaleString(),
        subtitle: "Review recommended",
        icon: AlertTriangle,
        iconColor: "#F59E0B", // Amber
        iconColorDark: "#D97706",
        bgLight: "#FFFBEB",
        borderColor: "#F59E0B",
        changeType: "warning",
      },
      {
        title: "Today's Events",
        value: todaysEvents.toLocaleString(),
        subtitle: "Since midnight",
        icon: Info,
        iconColor: "#3B82F6", // Blue
        iconColorDark: "#1D4ED8",
        bgLight: "#EFF6FF",
        borderColor: "#3B82F6",
        changeType: "positive",
      },
    ],
    [totalEvents, criticalEvents, warnings, todaysEvents]
  );

  // Search logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.action?.toLowerCase().includes(searchLower) ||
        log.userEmail?.toLowerCase().includes(searchLower) ||
        log.resource?.toLowerCase().includes(searchLower)
      );
    });
  }, [logs, searchTerm]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/sys-admin/auditlogs", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setLogs(response.data))
      .catch((error) => console.error("Error fetching logs:", error));
  }, [token]);

  const getSeverityStyles = (severity) => {
    const s = severity ? severity.toLowerCase() : "info";
    switch (s) {
      case "critical":
        return "bg-red-100 text-red-600 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "success":
        return "bg-green-100 text-green-600 border-green-200";
      default:
        return "bg-blue-100 text-blue-600 border-blue-200";
    }
  };

  return (
    <div>
      {/* Stats Cards Section */}
      <div className="flex flex-wrap gap-4 lg:gap-6 mb-8">
        {statCardsData.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b">
          <div>
            <h2 className="text-xl font-bold" style={{ color: THEME.dark }}>
              System Activity Log
            </h2>
            <p className="text-sm" style={{ color: THEME.muted }}>
              Detailed audit trail of all system events
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#02C39A]"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4 border-b">Timestamp</th>
                <th className="p-4 border-b">User</th>
                <th className="p-4 border-b">Action</th>
                <th className="p-4 border-b">Resource</th>
                <th className="p-4 border-b">Severity</th>
                <th className="p-4 border-b">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">
                      {log.userEmail}
                    </div>
                    <div className="text-xs text-gray-400">{log.role}</div>
                  </td>
                  <td className="p-4 text-gray-700">{log.action}</td>
                  <td className="p-4 text-gray-500">{log.resource}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityStyles(
                        log.severity
                      )}`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 font-mono">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
