import { useState, useCallback, useEffect } from "react";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  BarChart3,
  PieChart,
} from "lucide-react";
import Swal from "sweetalert2";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getOrganizationsReport,
  getRevenueReport,
  getModuleUsageReport,
  getAllExtendedModules,
  getAllBillingPlans,
} from "../../api/adminApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const THEME = {
  primary: "#02C39A",
  secondary: "#05668D",
  dark: "#0C397A",
  background: "#F1FDF9",
  success: "#1ED292",
  text: "#333333",
  muted: "#9B9B9B",
};

const SystemReports = () => {
  const [activeReport, setActiveReport] = useState("companies");
  const [loading, setLoading] = useState(false);

  // Report 1: Client Companies State
  const [companiesData, setCompaniesData] = useState(null);
  const [companiesFilters, setCompaniesFilters] = useState({
    fromDate: "",
    toDate: "",
    billingPlan: "ALL",
    extendedModules: [],
  });

  // Report 2: Revenue State
  const [revenueData, setRevenueData] = useState(null);
  const [revenueFilter, setRevenueFilter] = useState("THIS_MONTH");

  // Report 3: Module Usage State
  const [moduleUsageData, setModuleUsageData] = useState(null);
  const [moduleUsageFilter, setModuleUsageFilter] = useState("ALL");

  // Extended Modules State
  const [availableModules, setAvailableModules] = useState([]);

  // Billing Plans State
  const [availablePlans, setAvailablePlans] = useState([]);

  // Fetch extended modules and billing plans on component mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await getAllExtendedModules();
        if (response.success) {
          setAvailableModules(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch extended modules:", error);
      }
    };

    const fetchBillingPlans = async () => {
      try {
        const response = await getAllBillingPlans();
        if (response.success) {
          setAvailablePlans(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch billing plans:", error);
      }
    };

    fetchModules();
    fetchBillingPlans();
  }, []);

  const reportTabs = [
    {
      id: "companies",
      label: "Client Companies",
      icon: Building,
      color: THEME.secondary,
    },
    {
      id: "revenue",
      label: "Revenue Report",
      icon: DollarSign,
      color: "#10B981",
    },
    {
      id: "modules",
      label: "Module Usage",
      icon: BarChart3,
      color: "#8B5CF6",
    },
  ];

  // Report 1: Generate Client Companies Report
  const generateCompaniesReport = useCallback(async () => {
    setLoading(true);
    try {
      // Call the actual backend API with real database data
      const response = await getOrganizationsReport({
        startDate: companiesFilters.fromDate || null,
        endDate: companiesFilters.toDate || null,
        billingPlan: companiesFilters.billingPlan,
        extendedModules: companiesFilters.extendedModules,
      });

      if (response.success) {
        const reportData = response.data;
        setCompaniesData(reportData);

        Swal.fire({
          icon: "success",
          title: "Report Generated!",
          text: `Found ${reportData.totalOrganizations} organizations matching filters`,
          confirmButtonColor: THEME.primary,
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate report",
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setLoading(false);
    }
  }, [companiesFilters]);

  // Report 2: Generate Revenue Report
  const generateRevenueReport = useCallback(async () => {
    setLoading(true);
    try {
      // Call actual backend API with real PaymentTransaction data
      const response = await getRevenueReport(revenueFilter);

      if (response.success) {
        const reportData = response.data;
        setRevenueData(reportData);

        Swal.fire({
          icon: "success",
          title: "Revenue Report Generated!",
          text: `Total Revenue: $${reportData.totalRevenue.toLocaleString()}`,
          confirmButtonColor: THEME.primary,
        });
      }
    } catch (error) {
      console.error("Error generating revenue report:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate revenue report",
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setLoading(false);
    }
  }, [revenueFilter]);

  // Report 3: Generate Module Usage Report
  const generateModuleUsageReport = useCallback(async () => {
    setLoading(true);
    try {
      // Call actual backend API with real OrganizationModule data
      const response = await getModuleUsageReport(moduleUsageFilter);

      if (response.success) {
        const reportData = response.data;
        setModuleUsageData(reportData);

        Swal.fire({
          icon: "success",
          title: "Module Usage Report Generated!",
          text: `Analyzed ${reportData.totalOrganizations} organizations`,
          confirmButtonColor: THEME.primary,
        });
      }
    } catch (error) {
      console.error("Error generating module usage report:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate module usage report",
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setLoading(false);
    }
  }, [moduleUsageFilter]);

  // Export to PDF - Companies Report
  const exportCompaniesToPDF = () => {
    if (!companiesData || !companiesData.organizations) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "Please generate the report first",
        confirmButtonColor: THEME.primary,
      });
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(12, 57, 122);
    doc.text("Client Companies Report", 14, 22);

    // Summary info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(
      `Total Organizations: ${companiesData.totalOrganizations}`,
      14,
      36
    );
    doc.text(
      `Total Monthly Revenue: LKR ${companiesData.totalMonthlyRevenue.toLocaleString()}`,
      14,
      42
    );

    // Table
    autoTable(doc, {
      startY: 48,
      head: [
        [
          "Organization",
          "Email",
          "Status",
          "Billing Plan",
          "Plan Price (LKR)",
          "Active Users",
          "Monthly Revenue (LKR)",
        ],
      ],
      body: companiesData.organizations.map((org) => [
        org.organizationName,
        org.email,
        org.status,
        org.billingPlan,
        org.planPrice?.toFixed(2) || "0.00",
        org.activeUsers,
        org.monthlyRevenue?.toFixed(2) || "0.00",
      ]),
      headStyles: { fillColor: [5, 102, 141] },
      alternateRowStyles: { fillColor: [241, 253, 249] },
    });

    doc.save(`Companies_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Export to Excel - Companies Report
  const exportCompaniesToExcel = () => {
    if (!companiesData || !companiesData.organizations) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "Please generate the report first",
        confirmButtonColor: THEME.primary,
      });
      return;
    }

    const ws = XLSX.utils.json_to_sheet(
      companiesData.organizations.map((org) => ({
        Organization: org.organizationName,
        Email: org.email,
        Status: org.status,
        "Billing Plan": org.billingPlan,
        "Plan Price (LKR)": org.planPrice?.toFixed(2) || "0.00",
        "Active Users": org.activeUsers,
        "Billing Cycle": org.billingCycle,
        "Monthly Revenue (LKR)": org.monthlyRevenue?.toFixed(2) || "0.00",
        "Extended Modules": org.extendedModules.join(", "),
        "Created Date": new Date(org.createdAt).toLocaleDateString(),
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Companies");
    XLSX.writeFile(
      wb,
      `Companies_Report_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Export Revenue Report to PDF
  const exportRevenueToPDF = () => {
    if (!revenueData) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "Please generate the revenue report first",
        confirmButtonColor: THEME.primary,
      });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(12, 57, 122);
    doc.text("Revenue Report", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Period: ${revenueFilter.replace(/_/g, " ")}`, 14, 36);
    doc.text(
      `Total Revenue: $${revenueData.totalRevenue.toLocaleString()}`,
      14,
      42
    );
    doc.text(`Total Transactions: ${revenueData.totalTransactions}`, 14, 48);

    // Plan Summary
    doc.setFontSize(12);
    doc.setTextColor(12, 57, 122);
    doc.text("Revenue by Billing Plan", 14, 58);

    const planData = Object.entries(revenueData.revenueByPlan || {}).map(
      ([plan, revenue]) => [plan, `$${revenue.toLocaleString()}`]
    );

    autoTable(doc, {
      startY: 62,
      head: [["Plan", "Total Revenue"]],
      body: planData,
      headStyles: { fillColor: [5, 102, 141] },
    });

    // Organizations table
    if (revenueData.organizationRevenues.length > 0) {
      doc.addPage();
      doc.setFontSize(12);
      doc.text("Revenue by Organization", 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [
          [
            "Organization",
            "Plan",
            "Revenue",
            "Transactions",
            "Active Users",
          ],
        ],
        body: revenueData.organizationRevenues.map((org) => [
          org.organizationName,
          org.billingPlan,
          `$${org.revenue.toFixed(2)}`,
          org.transactionCount,
          org.activeUsers,
        ]),
        headStyles: { fillColor: [5, 102, 141] },
        alternateRowStyles: { fillColor: [241, 253, 249] },
      });
    }

    doc.save(`Revenue_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Export Revenue Report to Excel
  const exportRevenueToExcel = () => {
    if (!revenueData) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "Please generate the revenue report first",
        confirmButtonColor: THEME.primary,
      });
      return;
    }

    const ws1 = XLSX.utils.json_to_sheet(
      revenueData.organizationRevenues.map((org) => ({
        Organization: org.organizationName,
        "Organization UUID": org.organizationUuid,
        "Billing Plan": org.billingPlan,
        Revenue: org.revenue,
        "Transaction Count": org.transactionCount,
        "Active Users": org.activeUsers,
        "Billing Cycle": org.billingCycle,
      }))
    );

    const ws2 = XLSX.utils.json_to_sheet(
      Object.entries(revenueData.revenueByPlan || {}).map(([plan, revenue]) => ({
        Plan: plan,
        "Total Revenue": revenue,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Organizations");
    XLSX.utils.book_append_sheet(wb, ws2, "Plan Summary");
    XLSX.writeFile(
      wb,
      `Revenue_Report_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Export Module Usage to PDF
  const exportModuleUsageToPDF = () => {
    if (!moduleUsageData) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "Please generate the module usage report first",
        confirmButtonColor: THEME.primary,
      });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(12, 57, 122);
    doc.text("Extended Module Usage Report", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Period: ${moduleUsageFilter.replace(/_/g, " ")}`, 14, 36);
    doc.text(
      `Total Organizations: ${moduleUsageData.totalOrganizations}`,
      14,
      42
    );
    doc.text(
      `Total Active Module Subscriptions: ${moduleUsageData.totalActiveModuleSubscriptions}`,
      14,
      48
    );
    doc.text(
      `Total Organizations: ${moduleUsageData.totalOrganizations}`,
      14,
      42
    );

    autoTable(doc, {
      startY: 56,
      head: [["Module", "Organizations Using", "Adoption Rate"]],
      body: moduleUsageData.moduleUsages.map((stat) => [
        stat.moduleName,
        stat.activeOrganizations,
        `${stat.adoptionRate.toFixed(1)}%`,
      ]),
      headStyles: { fillColor: [5, 102, 141] },
      alternateRowStyles: { fillColor: [241, 253, 249] },
    });

    doc.save(
      `Module_Usage_Report_${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  // Export Module Usage to Excel
  const exportModuleUsageToExcel = () => {
    if (!moduleUsageData) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "Please generate the module usage report first",
        confirmButtonColor: THEME.primary,
      });
      return;
    }

    const ws = XLSX.utils.json_to_sheet(
      moduleUsageData.moduleUsages.map((stat) => ({
        Module: stat.moduleName,
        Description: stat.moduleDescription,
        "Organizations Using": stat.activeOrganizations,
        "Adoption Rate": `${stat.adoptionRate.toFixed(1)}%`,
        "Total Organizations": moduleUsageData.totalOrganizations,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Module Usage");
    XLSX.writeFile(
      wb,
      `Module_Usage_Report_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-2xl lg:text-3xl font-bold"
            style={{ color: THEME.dark }}
          >
            System Reports
          </h1>
          <p className="mt-1" style={{ color: THEME.muted }}>
            Generate and export comprehensive platform reports
          </p>
        </div>

        {/* Report Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeReport === tab.id
                    ? "shadow-md"
                    : "bg-white border border-gray-200 hover:border-gray-300"
                }`}
                style={{
                  backgroundColor:
                    activeReport === tab.id ? tab.color : undefined,
                  color: activeReport === tab.id ? "white" : THEME.text,
                }}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Report 1: Client Companies */}
        {activeReport === "companies" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: THEME.dark }}
              >
                <Filter className="w-5 h-5" />
                Filters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: THEME.text }}
                  >
                    From Date
                  </label>
                  <input
                    type="date"
                    value={companiesFilters.fromDate}
                    onChange={(e) =>
                      setCompaniesFilters({
                        ...companiesFilters,
                        fromDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                    style={{ focusRingColor: THEME.primary }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: THEME.text }}
                  >
                    To Date
                  </label>
                  <input
                    type="date"
                    value={companiesFilters.toDate}
                    onChange={(e) =>
                      setCompaniesFilters({
                        ...companiesFilters,
                        toDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                    style={{ focusRingColor: THEME.primary }}
                  />
                </div>

                {/* Billing Plan */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: THEME.text }}
                  >
                    Billing Plan
                  </label>
                  <select
                    value={companiesFilters.billingPlan}
                    onChange={(e) =>
                      setCompaniesFilters({
                        ...companiesFilters,
                        billingPlan: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                    style={{ focusRingColor: THEME.primary }}
                  >
                    <option value="ALL">All Plans</option>
                    {availablePlans.map((plan) => (
                      <option key={plan.id} value={plan.name}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Generate Button */}
                <div className="flex items-end">
                  <button
                    onClick={generateCompaniesReport}
                    disabled={loading}
                    className="w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: THEME.primary, color: "white" }}
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                    Generate
                  </button>
                </div>
              </div>

              {/* Extended Modules Checkboxes */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label
                  className="block text-sm font-medium mb-3"
                  style={{ color: THEME.text }}
                >
                  Extended Modules (Filter by - Organization must have ALL selected):
                </label>
                <div className="flex flex-wrap gap-4">
                  {availableModules.map((module) => (
                    <label
                      key={module.moduleId}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={companiesFilters.extendedModules.includes(
                          module.name
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCompaniesFilters({
                              ...companiesFilters,
                              extendedModules: [
                                ...companiesFilters.extendedModules,
                                module.name,
                              ],
                            });
                          } else {
                            setCompaniesFilters({
                              ...companiesFilters,
                              extendedModules:
                                companiesFilters.extendedModules.filter(
                                  (m) => m !== module.name
                                ),
                            });
                          }
                        }}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: THEME.primary }}
                      />
                      <span className="text-sm" style={{ color: THEME.text }}>
                        {module.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            {companiesData && companiesData.organizations && companiesData.organizations.length > 0 && (
              <>
                {/* Summary Stats */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: THEME.dark }}>
                    Report Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold" style={{ color: THEME.secondary }}>
                        {companiesData.totalOrganizations}
                      </div>
                      <div className="text-sm text-gray-600">Total Organizations</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold" style={{ color: THEME.primary }}>
                        LKR {companiesData.totalMonthlyRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Monthly Revenue</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold" style={{ color: "#8B5CF6" }}>
                        {Object.keys(companiesData.planDistribution || {}).length}
                      </div>
                      <div className="text-sm text-gray-600">Billing Plans in Use</div>
                    </div>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={exportCompaniesToPDF}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: "#EF4444", color: "white" }}
                  >
                    <Download className="w-5 h-5" />
                    Export PDF
                  </button>
                  <button
                    onClick={exportCompaniesToExcel}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: "#10B981", color: "white" }}
                  >
                    <Download className="w-5 h-5" />
                    Export Excel
                  </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div
                    className="px-6 py-4 border-b border-gray-100"
                    style={{ backgroundColor: THEME.background }}
                  >
                    <h3
                      className="font-semibold"
                      style={{ color: THEME.dark }}
                    >
                      Client Companies Report ({companiesData.totalOrganizations}{" "}
                      organizations)
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: THEME.background }}>
                          <th
                            className="px-6 py-3 text-left text-sm font-semibold"
                            style={{ color: THEME.dark }}
                          >
                            Organization
                          </th>
                          <th
                            className="px-6 py-3 text-left text-sm font-semibold"
                            style={{ color: THEME.dark }}
                          >
                            Email
                          </th>
                          <th
                            className="px-6 py-3 text-left text-sm font-semibold"
                            style={{ color: THEME.dark }}
                          >
                            Status
                          </th>
                          <th
                            className="px-6 py-3 text-left text-sm font-semibold"
                            style={{ color: THEME.dark }}
                          >
                            Billing Plan
                          </th>
                          <th
                            className="px-6 py-3 text-left text-sm font-semibold"
                            style={{ color: THEME.dark }}
                          >
                            Active Users
                          </th>
                          <th
                            className="px-6 py-3 text-left text-sm font-semibold"
                            style={{ color: THEME.dark }}
                          >
                            Monthly Revenue
                          </th>
                          <th
                            className="px-6 py-3 text-left text-sm font-semibold"
                            style={{ color: THEME.dark }}
                          >
                            Registered
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {companiesData.organizations.map((org) => (
                          <tr
                            key={org.organizationName}
                            className="hover:bg-gray-50"
                          >
                            <td
                              className="px-6 py-4 font-medium"
                              style={{ color: THEME.dark }}
                            >
                              {org.organizationName}
                            </td>
                            <td
                              className="px-6 py-4 text-sm"
                              style={{ color: THEME.text }}
                            >
                              {org.email}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor:
                                    org.status === "ACTIVE"
                                      ? "#D1FAE5"
                                      : "#FEF3C7",
                                  color:
                                    org.status === "ACTIVE"
                                      ? "#059669"
                                      : "#D97706",
                                }}
                              >
                                {org.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium" style={{ color: THEME.text }}>
                                  {org.billingPlan || "N/A"}
                                </span>
                                <span className="text-xs" style={{ color: THEME.muted }}>
                                  LKR {org.planPrice?.toFixed(2) || "0.00"}
                                </span>
                              </div>
                            </td>
                            <td
                              className="px-6 py-4 text-sm"
                              style={{ color: THEME.text }}
                            >
                              {org.activeUsers || 0}
                            </td>
                            <td
                              className="px-6 py-4 text-sm font-semibold"
                              style={{ color: THEME.success }}
                            >
                              LKR {org.monthlyRevenue?.toFixed(2) || "0.00"}
                            </td>
                            <td
                              className="px-6 py-4 text-sm"
                              style={{ color: THEME.text }}
                            >
                              {new Date(org.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Report 2: Revenue */}
        {activeReport === "revenue" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: THEME.dark }}
              >
                <TrendingUp className="w-5 h-5" />
                Time Period
              </h3>

              <div className="flex flex-wrap gap-3">
                {[
                  { value: "last_month", label: "Last Month" },
                  { value: "last_3months", label: "Last 3 Months" },
                  { value: "last_6months", label: "Last 6 Months" },
                  { value: "last_year", label: "Last Year" },
                  { value: "last_3years", label: "Last 3 Years" },
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setRevenueFilter(period.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      revenueFilter === period.value
                        ? "shadow-md"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    style={{
                      backgroundColor:
                        revenueFilter === period.value
                          ? THEME.primary
                          : undefined,
                      color:
                        revenueFilter === period.value ? "white" : THEME.text,
                    }}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              <button
                onClick={generateRevenueReport}
                disabled={loading}
                className="mt-4 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: THEME.primary, color: "white" }}
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <DollarSign className="w-5 h-5" />
                )}
                Generate Revenue Report
              </button>
            </div>

            {/* Results */}
            {revenueData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm" style={{ color: THEME.muted }}>
                      Total Revenue
                    </p>
                    <p
                      className="text-3xl font-bold mt-2"
                      style={{ color: THEME.dark }}
                    >
                      ${revenueData.totalRevenue.toLocaleString()}
                    </p>
                  </div>

                  {Object.entries(revenueData.revenueByPlan || {}).map(([plan, revenue]) => (
                    <div
                      key={plan}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                    >
                      <p className="text-sm" style={{ color: THEME.muted }}>
                        {plan} Plan
                      </p>
                      <p
                        className="text-2xl font-bold mt-2"
                        style={{ color: THEME.dark }}
                      >
                        ${revenue.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Export Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={exportRevenueToPDF}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: "#EF4444", color: "white" }}
                  >
                    <Download className="w-5 h-5" />
                    Export PDF
                  </button>
                  <button
                    onClick={exportRevenueToExcel}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: "#10B981", color: "white" }}
                  >
                    <Download className="w-5 h-5" />
                    Export Excel
                  </button>
                </div>

                {/* Organizations Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div
                    className="px-6 py-4 border-b border-gray-100"
                    style={{ backgroundColor: THEME.background }}
                  >
                    <h3
                      className="font-semibold"
                      style={{ color: THEME.dark }}
                    >
                      Revenue by Organization ({revenueData.organizationRevenues.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: THEME.background }}>
                          <th
                            className="px-6 py-3 text-left text-sm font-semibold"
                            style={{ color: THEME.dark }}
                          >
                            Organization
                          </th>
                          <th
                            className="px-6 py-3 text-left text-sm font-semibold"
                            style={{ color: THEME.dark }}
                          >
                            Billing Plan
                          </th>
                          <th
                            className="px-6 py-3 text-left text-sm font-semibold"
                            style={{ color: THEME.dark }}
                          >
                            Revenue
                          </th>
                          <th
                            className="px-6 py-3 text-left text-sm font-semibold"
                            style={{ color: THEME.dark }}
                          >
                            Transactions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {revenueData.organizationRevenues.map((org, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td
                              className="px-6 py-4 font-medium"
                              style={{ color: THEME.dark }}
                            >
                              {org.organizationName}
                            </td>
                            <td
                              className="px-6 py-4 text-sm"
                              style={{ color: THEME.text }}
                            >
                              {org.billingPlan}
                            </td>
                            <td
                              className="px-6 py-4 text-sm font-semibold"
                              style={{ color: THEME.success }}
                            >
                              ${org.revenue.toFixed(2)}
                            </td>
                            <td
                              className="px-6 py-4 text-sm"
                              style={{ color: THEME.text }}
                            >
                              {org.transactionCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Report 3: Module Usage */}
        {activeReport === "modules" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: THEME.dark }}
              >
                <PieChart className="w-5 h-5" />
                Time Period
              </h3>

              <div className="flex flex-wrap gap-3">
                {[
                  { value: "ALL", label: "All Time" },
                  { value: "THIS_MONTH", label: "This Month" },
                  { value: "LAST_3_MONTHS", label: "Last 3 Months" },
                  { value: "LAST_6_MONTHS", label: "Last 6 Months" },
                  { value: "LAST_YEAR", label: "Last Year" },
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setModuleUsageFilter(period.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      moduleUsageFilter === period.value
                        ? "shadow-md"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    style={{
                      backgroundColor:
                        moduleUsageFilter === period.value
                          ? THEME.primary
                          : undefined,
                      color:
                        moduleUsageFilter === period.value
                          ? "white"
                          : THEME.text,
                    }}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              <button
                onClick={generateModuleUsageReport}
                disabled={loading}
                className="mt-4 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: THEME.primary, color: "white" }}
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <BarChart3 className="w-5 h-5" />
                )}
                Generate Module Usage Report
              </button>
            </div>

            {/* Results */}
            {moduleUsageData && (
              <>
                {/* Summary Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm" style={{ color: THEME.muted }}>
                    Total Organizations Analyzed
                  </p>
                  <p
                    className="text-4xl font-bold mt-2"
                    style={{ color: THEME.dark }}
                  >
                    {moduleUsageData.totalOrganizations}
                  </p>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={exportModuleUsageToPDF}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: "#EF4444", color: "white" }}
                  >
                    <Download className="w-5 h-5" />
                    Export PDF
                  </button>
                  <button
                    onClick={exportModuleUsageToExcel}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: "#10B981", color: "white" }}
                  >
                    <Download className="w-5 h-5" />
                    Export Excel
                  </button>
                </div>

                {/* Stats Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div
                    className="px-6 py-4 border-b border-gray-100"
                    style={{ backgroundColor: THEME.background }}
                  >
                    <h3
                      className="font-semibold"
                      style={{ color: THEME.dark }}
                    >
                      Extended Module Usage Statistics
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {moduleUsageData.moduleUsages.map((stat, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className="font-medium"
                              style={{ color: THEME.dark }}
                            >
                              {stat.moduleName}
                            </span>
                            <span
                              className="text-sm"
                              style={{ color: THEME.muted }}
                            >
                              {stat.activeOrganizations} organizations ({stat.adoptionRate.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="h-3 rounded-full transition-all"
                              style={{
                                width: `${stat.adoptionRate}%`,
                                backgroundColor: THEME.primary,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SystemReports;