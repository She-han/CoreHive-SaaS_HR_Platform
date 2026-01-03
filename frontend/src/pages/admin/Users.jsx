import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const THEME = {
  primary: "#02C39A",
  secondary: "#05668D",
  dark: "#0C397A",
  background: "#F1FDF9",
  success: "#1ED292",
  text: "#333333",
  muted: "#9B9B9B",
};

const users = [
  {
    name: "David Wilson",
    email: "david@acme.com",
    initials: "DW",
    org: "Acme Corporation",
    employees: 450,
    status: "active",
    role: "system",
    lastActive: "2025-11-11 11:20",
  },
  {
    name: "Emma Davis",
    email: "emma@techstart.io",
    initials: "ED",
    org: "TechStart Inc.",
    employees: 85,
    status: "active",
    role: "organization",
    lastActive: "2025-11-11 08:45",
  },
  {
    name: "Robert Martinez",
    email: "robert@globalsol.com",
    initials: "RM",
    org: "Global Solutions Ltd",
    employees: 320,
    status: "active",
    role: "organization",
    lastActive: "2025-11-10 14:30",
  },
  {
    name: "Lisa Anderson",
    email: "lisa@innovalabs.io",
    initials: "LA",
    org: "Innovation Labs",
    employees: 25,
    status: "active",
    role: "system",
    lastActive: "2025-11-09 17:00",
  },
];

const Users = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("system");

  const filteredUsers = users.filter((u) => {
    const matchesTab = u.role === tab;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.org.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: THEME.dark }}
                >
                  User Management 🤵‍♀️
                </h1>
                <p className="mt-1" style={{ color: THEME.muted }}>
                  Manage system administrators and organization admins
                </p>
              </div>
            </div>
          </div>

          {/* Tabs and Search */}
         
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    Administrative Users
                  </h2>
                  <p className="text-sm text-gray-500">
                    System and organization administrators
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring"
                />
              </div>
              
              <div className="flex gap-2 rounded-full mb-4">
                <button
                  onClick={() => setTab("system")}
                  className={`px-4 py-1.5 text-sm rounded-full font-medium ${
                    tab === "system" ? "bg-gray-100" : "bg-white border"
                  }`}
                >
                  System Admins (2)
                </button>
                <button
                  onClick={() => setTab("organization")}
                  className={`px-4 py-1.5 text-sm rounded-full font-medium ${
                    tab === "organization" ? "bg-gray-100" : "bg-white border"
                  }`}
                >
                  Organization Admins (2)
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500 border-b">
                    <tr>
                      <th className="py-3">User</th>
                      <th>Organization</th>
                      <th>Employees</th>
                      <th>Status</th>
                      <th>Last Active</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-4 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                            {u.initials}
                          </div>
                          <div>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-gray-500 text-xs">
                              {u.email}
                            </div>
                          </div>
                        </td>
                        <td>{u.org}</td>
                        <td className="flex items-center gap-1">
                          👤 {u.employees}
                        </td>
                        <td>
                          <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            {u.status}
                          </span>
                        </td>
                        <td className="text-gray-500">{u.lastActive}</td>
                        <td className="text-right text-xl cursor-pointer">⋮</td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-8 text-gray-400"
                        >
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          
        </div>
      </DashboardLayout>
    </div>
  );
};

export default Users;
