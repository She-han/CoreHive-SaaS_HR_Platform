import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Swal from "sweetalert2";
import apiClient from "../../api/axios";

const Payslips = () => {
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  /* ---------------- MOCK DATA (Replace with API) ---------------- */

  const salarySummary = {
    basic: 120000,
    allowances: 30000,
    deductions: 15000,
    netSalary: 135000,
  };

  const payslips = [
    {
      id: 1,
      month: "January 2025",
      netSalary: 135000,
      status: "PAID",
      pdfUrl: "/mock/payslips/jan-2025.pdf",
    },
    {
      id: 2,
      month: "December 2024",
      netSalary: 130000,
      status: "PAID",
      pdfUrl: "/mock/payslips/dec-2024.pdf",
    },
  ];

  const promotions = [
    {
      id: 1,
      title: "Junior Software Engineer → Software Engineer",
      effectiveDate: "2024-08-01",
      salaryIncrease: 15000,
    },
    {
      id: 2,
      title: "Intern → Junior Software Engineer",
      effectiveDate: "2023-06-01",
      salaryIncrease: 20000,
    },
  ];

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 🔹 Replace with API calls
      } catch {
        Swal.fire({
          icon: "error",
          title: "Failed to load payslips",
          confirmButtonColor: "#02C39A",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const downloadPayslip = (url) => {
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-10 animate-fade-in">

        {/* ================= SALARY SUMMARY ================= */}
        <div className="bg-white rounded-xl p-8 shadow border border-[#f1f5f9]">
          <h1 className="text-2xl font-semibold mb-6">Salary Summary</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SummaryCard label="Basic Salary" value={salarySummary.basic} />
            <SummaryCard label="Allowances" value={salarySummary.allowances} />
            <SummaryCard label="Deductions" value={salarySummary.deductions} negative />
            <SummaryCard label="Net Salary" value={salarySummary.netSalary} highlight />
          </div>
        </div>

        {/* ================= PAYSLIPS LIST ================= */}
        <div className="bg-white rounded-xl p-8 shadow border border-[#f1f5f9]">
          <h2 className="text-xl font-semibold mb-6">Payslips</h2>

          {payslips.map((p) => (
            <div
              key={p.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 mb-3 border rounded-lg hover:bg-gray-50 transition"
            >
              {/* Left */}
              <div>
                <p className="font-medium">{p.month}</p>
                <p className="text-xs text-gray-500">
                  Net Salary: LKR {p.netSalary.toLocaleString()}
                </p>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {p.status}
                </span>

                <button
                  onClick={() => setSelectedPayslip(p)}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
                >
                  View
                </button>

                <button
                  onClick={() => downloadPayslip(p.pdfUrl)}
                  className="px-4 py-2 text-sm bg-[var(--color-primary-500)] text-white rounded-lg hover:opacity-90"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================= PAYSLIP DETAILS ================= */}
        {selectedPayslip && (
          <div className="bg-white rounded-xl p-8 shadow border border-[#f1f5f9] animate-slide-up">
            <button
              onClick={() => setSelectedPayslip(null)}
              className="text-sm text-blue-600 mb-4"
            >
              ← Back to payslips
            </button>

            <h2 className="text-xl font-semibold mb-2">
              {selectedPayslip.month} Payslip
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Net Salary: LKR {selectedPayslip.netSalary.toLocaleString()}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => downloadPayslip(selectedPayslip.pdfUrl)}
                className="bg-[var(--color-primary-500)] text-white px-8 py-3 rounded-lg"
              >
                Download PDF
              </button>
            </div>
          </div>
        )}

        {/* ================= PROMOTIONS ================= */}
        <div className="bg-white rounded-xl p-8 shadow border border-[#f1f5f9]">
          <h2 className="text-xl font-semibold mb-6">Promotion History</h2>

          {promotions.length === 0 ? (
            <p className="text-sm text-gray-500">No promotions yet.</p>
          ) : (
            promotions.map((promo) => (
              <div
                key={promo.id}
                className="p-4 mb-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{promo.title}</p>
                  <p className="text-xs text-gray-500">
                    Effective from{" "}
                    {new Date(promo.effectiveDate).toLocaleDateString()}
                  </p>
                </div>

                <span className="text-sm font-semibold text-green-600">
                  + LKR {promo.salaryIncrease.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

/* ================= REUSABLE SUMMARY CARD ================= */

const SummaryCard = ({ label, value, highlight, negative }) => {
  return (
    <div
      className={`rounded-xl p-6 border text-center ${
        highlight
          ? "bg-green-50 border-green-200"
          : negative
          ? "bg-red-50 border-red-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <p
        className={`text-xl font-semibold ${
          highlight
            ? "text-green-700"
            : negative
            ? "text-red-700"
            : "text-gray-800"
        }`}
      >
        LKR {value.toLocaleString()}
      </p>
    </div>
  );
};

export default Payslips;
