import { useState } from "react";
import HeadcountReport from "./HeadcountReport";
import MonthlyReport from "./MonthlyReport";
import AnnualReport from "./AnnualReport";

export default function HRReportingManagement() {
  const [activeTab, setActiveTab] = useState("headcount");

  const renderActiveReport = () => {
    switch (activeTab) {
      case "headcount":
        return <HeadcountReport />;
      case "monthly":
        return <MonthlyReport />;
      case "annual":
        return <AnnualReport />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{ backgroundColor: "#F1FDF9" }}
      className="w-full h-screen flex flex-col p-8"
    >
      {/* Header */}
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-[#333333]">
          HR Reports
        </h1>
        <p className="text-[#9B9B9B] font-medium">
          Workforce insights & analytics
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { key: "headcount", label: "Headcount Report" },
          { key: "monthly", label: "Monthly Report" },
          { key: "annual", label: "Annual Report" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              px-4 py-2 rounded-lg text-sm font-semibold transition
              ${
                activeTab === tab.key
                  ? "bg-[#05668D] text-white"
                  : "bg-[#FFFFFF] text-[#333333] border border-[#9B9B9B] hover:bg-[#F1FDF9]"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content (Scrollable like EmployeeManagement) */}
      <div className="flex-1 overflow-y-auto">
        {renderActiveReport()}
      </div>
    </div>
  );
}
