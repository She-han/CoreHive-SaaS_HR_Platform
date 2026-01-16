import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Download,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

const RecentActivities = () => {
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem("corehive_token");

  // Total Events
  const totalEvents = logs.length;

  // Critical Events (severity === 'Critical')
  const criticalEvents = logs.filter(
    (log) => log.severity?.toLowerCase() === "critical"
  ).length;

  // Warnings (severity === 'Warning')
  const warnings = logs.filter(
    (log) => log.severity?.toLowerCase() === "warning"
  ).length;

  // Today's Events
  const today = new Date().toISOString().split("T")[0];
  const todaysEvents = logs.filter((log) =>
    log.timestamp?.startsWith(today)
  ).length;

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    colorClass,
    iconBg,
  }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start flex-1 min-w-[240px]">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-1 text-gray-800">{value}</h3>
        <p className={`text-xs mt-2 ${colorClass}`}>{subtitle}</p>
      </div>
      <div className={`p-3 rounded-lg ${iconBg}`}>
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
    </div>
  );

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/sys-admin/auditlogs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setLogs(response.data))
      .catch((error) => console.error("Error fetching logs:", error));
  }, []);

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

      {/* Stats Cards Section*/}
      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard
          title="Total Events"
          value={totalEvents}
          subtitle="Last 7 days"
          icon={ShieldCheck}
          colorClass="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Critical Events"
          value={criticalEvents}
          subtitle="Requires attention"
          icon={AlertCircle}
          colorClass="text-red-600"
          iconBg="bg-red-50"
        />
        <StatCard
          title="Warnings"
          value={warnings}
          subtitle="Review recommended"
          icon={AlertTriangle}
          colorClass="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Today's Events"
          value={todaysEvents}
          subtitle="Since midnight"
          icon={Info}
          colorClass="text-blue-600"
          iconBg="bg-blue-50"
        />
      </div>

{/* table details Section*/}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              System Activity Log
            </h2>
            <p className="text-sm text-gray-500">
              Detailed audit trail of all system events
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                className="pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-50">
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
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
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
