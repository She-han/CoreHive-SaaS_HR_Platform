import { useState } from "react";
import {
  Search,
  Users,
  Calendar,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const organizationsData = [
  {
    name: "Acme Corporation",
    domain: "acme.com",
    plan: "Enterprise",
    employees: 450,
    status: "active",
    billing: "$1,499/mo",
    created: "2024-01-15",
  },
  {
    name: "TechStart Inc.",
    domain: "techstart.io",
    plan: "Professional",
    employees: 85,
    status: "active",
    billing: "$599/mo",
    created: "2024-06-20",
  },
  {
    name: "Global Solutions Ltd",
    domain: "globalsol.com",
    plan: "Enterprise",
    employees: 320,
    status: "active",
    billing: "$1,199/mo",
    created: "2024-03-10",
  },
  {
    name: "Innovation Labs",
    domain: "innolabs.io",
    plan: "Starter",
    employees: 25,
    status: "trial",
    billing: "$199/mo",
    created: "2025-10-28",
  },
  {
    name: "Digital Dynamics",
    domain: "digidyn.com",
    plan: "Professional",
    employees: 150,
    status: "suspended",
    billing: "$799/mo",
    created: "2024-08-05",
  },
  {
    name: "StartUp Hub",
    domain: "startuphub.co",
    plan: "Starter",
    employees: 18,
    status: "active",
    billing: "$199/mo",
    created: "2025-09-12",
  },
];

const statusStyles = {
  active: "bg-green-100 text-green-700",
  trial: "bg-blue-100 text-blue-700",
  suspended: "bg-red-100 text-red-700",
};

const statusIcon = {
  active: <CheckCircle size={14} />,
  trial: <Clock size={14} />,
  suspended: <XCircle size={14} />,
};

export default function Organizations() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = organizationsData.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.domain.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || org.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Organizations</h2>
          <p className="text-sm text-gray-500">
            View and manage all tenant organizations
          </p>
        </div>

        <div className="flex gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="bg-gray-100 rounded-lg px-3 mx-3 py-2 text-sm">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-gray-500">
            <tr>
              <th className="text-left py-3">Organization</th>
              <th className="text-left">Plan</th>
              <th>Employees</th>
              <th  className="text-center">Status</th>
              <th>Billing</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((org, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-4">
                  <div className="font-medium">{org.name}</div>
                  <div className="text-gray-500 text-xs">{org.domain}</div>
                </td>

                <td>
                    <div className="flex justify-right">
                  <span className="px-3 py-1 border border-gray-300 rounded-lg items-center text-xs">
                    {org.plan}
                  </span>
                  </div>
                </td>

                <td>
                  <div className="flex items-center gap-1 justify-center">
                    <Users size={14} />
                    {org.employees}
                  </div>
                </td>

                <td>
                    <div className="flex justify-center">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs ${
                      statusStyles[org.status]
                    }`}
                  >
                    {statusIcon[org.status]}
                    {org.status}
                  </span>
                  </div>
                </td>

                <td><div className="flex justify-center">{org.billing}</div></td>

                <td>
                  <div className="flex items-center gap-1 justify-center">
                    <Calendar size={14} />
                    {org.created}
                  </div>
                </td>

                <td>
                  <MoreVertical className="cursor-pointer text-gray-400 hover:text-gray-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
