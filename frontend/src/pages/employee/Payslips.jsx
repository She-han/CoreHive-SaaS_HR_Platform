import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import Swal from "sweetalert2";
import * as payrollApi from "../../api/payrollApi";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Payslips = () => {
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get latest salary summary from most recent payslip
  const latestPayslip = payslips.length > 0 ? payslips[0] : null;
  
  const salarySummary = latestPayslip ? {
    basic: latestPayslip.basicSalary || 0,
    allowances: latestPayslip.totalAllowances || 0,
    deductions: latestPayslip.totalDeductions || 0,
    netSalary: latestPayslip.netSalary || 0,
    month: latestPayslip.month,
    year: latestPayslip.year
  } : {
    basic: 0,
    allowances: 0,
    deductions: 0,
    netSalary: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  };

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await payrollApi.getEmployeePayslips();
        // Filter only APPROVED payslips and sort by date (newest first)
        const approvedPayslips = response.data
          .filter(p => p.status === 'APPROVED')
          .sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            return b.month - a.month;
          });
        setPayslips(approvedPayslips);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Failed to load payslips",
          text: error.response?.data?.message || "An error occurred",
          confirmButtonColor: "#02C39A",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleViewPayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setIsViewModalOpen(true);
  };

  const downloadPayslipPDF = async (payslip) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Header
      doc.setFillColor(2, 195, 154);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont(undefined, 'bold');
      doc.text('SALARY SLIP', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`${months[payslip.month - 1]} ${payslip.year}`, pageWidth / 2, 30, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      
      // Employee Details
      let yPos = 50;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Employee Information', 14, yPos);
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      const employeeInfo = [
        ['Employee Code:', payslip.employeeCode || 'N/A'],
        ['Employee Name:', payslip.employeeName || 'N/A'],
        ['Designation:', payslip.designation || 'N/A'],
        ['Department:', payslip.departmentName || 'N/A']
      ];
      
      employeeInfo.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        doc.text(label, 14, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(value, 70, yPos);
        yPos += 7;
      });
      
      // Earnings
      yPos += 5;
      doc.setFillColor(245, 247, 250);
      doc.rect(10, yPos - 5, pageWidth - 20, 8, 'F');
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
      doc.text('EARNINGS', 14, yPos);
      yPos += 10;
      
      const earningsData = [['Basic Salary', `LKR ${(payslip.basicSalary || 0).toFixed(2)}`]];
      
      if (payslip.otPay && payslip.otPay > 0) {
        earningsData.push(['OT Pay', `LKR ${payslip.otPay.toFixed(2)}`]);
      }
      
      if (payslip.allowancesBreakdown && payslip.allowancesBreakdown.length > 0) {
        payslip.allowancesBreakdown.forEach(allowance => {
          earningsData.push([allowance.name, `LKR ${allowance.amount.toFixed(2)}`]);
        });
      } else if (payslip.totalAllowances > 0) {
        earningsData.push(['Total Allowances', `LKR ${payslip.totalAllowances.toFixed(2)}`]);
      }
      
      doc.autoTable({
        startY: yPos,
        head: [],
        body: earningsData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 100, fontStyle: 'normal' },
          1: { cellWidth: 80, halign: 'right', fontStyle: 'normal' }
        },
        margin: { left: 14, right: 14 }
      });
      
      yPos = doc.lastAutoTable.finalY + 5;
      
      // Gross Salary
      doc.setFillColor(232, 245, 241);
      doc.rect(10, yPos, pageWidth - 20, 8, 'F');
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Gross Salary', 14, yPos + 6);
      doc.text(`LKR ${(payslip.grossSalary || 0).toFixed(2)}`, pageWidth - 14, yPos + 6, { align: 'right' });
      yPos += 15;
      
      // Deductions
      doc.setFillColor(245, 247, 250);
      doc.rect(10, yPos - 5, pageWidth - 20, 8, 'F');
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
      doc.text('DEDUCTIONS', 14, yPos);
      yPos += 10;
      
      const deductionsData = [];
      
      if (payslip.epfEmployee && payslip.epfEmployee > 0) {
        deductionsData.push([`EPF Employee (${payslip.epfEmployeeRate || 8}%)`, `LKR ${payslip.epfEmployee.toFixed(2)}`]);
      }
      
      if (payslip.tax && payslip.tax > 0) {
        deductionsData.push([`Tax (${payslip.taxRate || 0}%)`, `LKR ${payslip.tax.toFixed(2)}`]);
      }
      
      if (payslip.deductionsBreakdown && payslip.deductionsBreakdown.length > 0) {
        payslip.deductionsBreakdown.forEach(deduction => {
          deductionsData.push([deduction.name, `LKR ${deduction.amount.toFixed(2)}`]);
        });
      } else if (payslip.totalDeductions > 0) {
        deductionsData.push(['Other Deductions', `LKR ${(payslip.totalDeductions - (payslip.epfEmployee || 0) - (payslip.tax || 0)).toFixed(2)}`]);
      }
      
      if (deductionsData.length > 0) {
        doc.autoTable({
          startY: yPos,
          head: [],
          body: deductionsData,
          theme: 'plain',
          styles: { fontSize: 10, cellPadding: 3, textColor: [220, 38, 38] },
          columnStyles: {
            0: { cellWidth: 100, fontStyle: 'normal' },
            1: { cellWidth: 80, halign: 'right', fontStyle: 'normal' }
          },
          margin: { left: 14, right: 14 }
        });
        yPos = doc.lastAutoTable.finalY + 5;
      }
      
      // Total Deductions
      doc.setFillColor(254, 242, 242);
      doc.rect(10, yPos, pageWidth - 20, 8, 'F');
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('Total Deductions', 14, yPos + 6);
      doc.text(`LKR ${(payslip.totalDeductions || 0).toFixed(2)}`, pageWidth - 14, yPos + 6, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      yPos += 15;
      
      // Employer Contributions
      doc.setFillColor(245, 247, 250);
      doc.rect(10, yPos - 5, pageWidth - 20, 8, 'F');
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
      doc.text('EMPLOYER CONTRIBUTIONS', 14, yPos);
      yPos += 10;
      
      const contributionsData = [];
      if (payslip.epfEmployer && payslip.epfEmployer > 0) {
        contributionsData.push([`EPF Employer (${payslip.epfEmployerRate || 12}%)`, `LKR ${payslip.epfEmployer.toFixed(2)}`]);
      }
      if (payslip.etf && payslip.etf > 0) {
        contributionsData.push([`ETF (${payslip.etfRate || 3}%)`, `LKR ${payslip.etf.toFixed(2)}`]);
      }
      
      if (contributionsData.length > 0) {
        doc.autoTable({
          startY: yPos,
          head: [],
          body: contributionsData,
          theme: 'plain',
          styles: { fontSize: 10, cellPadding: 3, textColor: [59, 130, 246] },
          columnStyles: {
            0: { cellWidth: 100, fontStyle: 'normal' },
            1: { cellWidth: 80, halign: 'right', fontStyle: 'normal' }
          },
          margin: { left: 14, right: 14 }
        });
        yPos = doc.lastAutoTable.finalY + 5;
      } else {
        yPos += 5;
      }
      
      // Net Salary (regular row)
      doc.setFillColor(245, 247, 250);
      doc.rect(10, yPos, pageWidth - 20, 8, 'F');
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Net Salary', 14, yPos + 6);
      doc.text(`LKR ${(payslip.netSalary || 0).toFixed(2)}`, pageWidth - 14, yPos + 6, { align: 'right' });
      yPos += 15;
      
      // Net Salary (highlighted)
      doc.setFillColor(2, 195, 154);
      doc.rect(10, yPos, pageWidth - 20, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('NET SALARY', 14, yPos + 8);
      doc.text(`LKR ${(payslip.netSalary || 0).toFixed(2)}`, pageWidth - 14, yPos + 8, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      
      // Footer
      doc.setFontSize(8);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('This is a computer-generated payslip and does not require a signature.', pageWidth / 2, pageHeight - 15, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      doc.save(`Payslip_${payslip.employeeCode}_${months[payslip.month - 1]}_${payslip.year}.pdf`);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to download payslip",
        confirmButtonColor: "#02C39A",
      });
    }
  };

  if (loading) {
    return (
      
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
    
    );
  }

  return (
    
      <div className="p-8 max-w-6xl mx-auto space-y-10 animate-fade-in">

        {/* ================= SALARY SUMMARY ================= */}
        <div className="bg-white rounded-xl p-8 shadow border border-[#f1f5f9]">
          <h1 className="text-2xl font-semibold mb-2">Latest Salary Summary</h1>
          <p className="text-sm text-gray-500 mb-6">
            {months[salarySummary.month - 1]} {salarySummary.year}
          </p>

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

          {payslips.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No approved payslips available yet.</p>
          ) : (
            payslips.map((p) => (
              <div
                key={p.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 mb-3 border rounded-lg hover:bg-gray-50 transition"
              >
                {/* Left */}
                <div>
                  <p className="font-medium">{months[p.month - 1]} {p.year}</p>
                  <p className="text-xs text-gray-500">
                    Net Salary: LKR {p.netSalary?.toLocaleString()}
                  </p>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    APPROVED
                  </span>

                  <button
                    onClick={() => handleViewPayslip(p)}
                    className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
                  >
                    View
                  </button>

                  <button
                    onClick={() => downloadPayslipPDF(p)}
                    className="px-4 py-2 text-sm bg-[#02C39A] text-white rounded-lg hover:opacity-90"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ================= PAYSLIP DETAILS MODAL ================= */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedPayslip(null);
          }}
          title={selectedPayslip ? `Payslip - ${months[selectedPayslip.month - 1]} ${selectedPayslip.year}` : ''}
          size="lg"
        >
          {selectedPayslip && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-[#0C397A]">Employee Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Employee Code:</span>
                    <p className="font-medium">{selectedPayslip.employeeCode}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Designation:</span>
                    <p className="font-medium">{selectedPayslip.designation}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <p className="font-medium">{selectedPayslip.departmentName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Period:</span>
                    <p className="font-medium">{months[selectedPayslip.month - 1]} {selectedPayslip.year}</p>
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h3 className="font-semibold mb-3 text-[#0C397A]">Earnings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span className="font-medium">LKR {selectedPayslip.basicSalary?.toFixed(2)}</span>
                  </div>
                  {selectedPayslip.otHours > 0 && (
                    <div className="flex justify-between">
                      <span>OT Pay ({selectedPayslip.otHours?.toFixed(2)} hrs)</span>
                      <span className="font-medium text-blue-600">LKR {selectedPayslip.otPay?.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedPayslip.allowancesBreakdown?.map((allowance, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{allowance.name}</span>
                      <span className="font-medium text-green-600">LKR {allowance.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                  {!selectedPayslip.allowancesBreakdown && selectedPayslip.totalAllowances > 0 && (
                    <div className="flex justify-between">
                      <span>Total Allowances</span>
                      <span className="font-medium text-green-600">LKR {selectedPayslip.totalAllowances?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Gross Salary</span>
                    <span>LKR {selectedPayslip.grossSalary?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="font-semibold mb-3 text-[#0C397A]">Deductions</h3>
                <div className="space-y-2 text-sm">
                  {selectedPayslip.epfEmployee > 0 && (
                    <div className="flex justify-between">
                      <span>EPF Employee ({selectedPayslip.epfEmployeeRate || 8}%)</span>
                      <span className="font-medium text-red-600">LKR {selectedPayslip.epfEmployee?.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedPayslip.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({selectedPayslip.taxRate || 0}%)</span>
                      <span className="font-medium text-red-600">LKR {selectedPayslip.tax?.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedPayslip.deductionsBreakdown?.map((deduction, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{deduction.name}</span>
                      <span className="font-medium text-red-600">LKR {deduction.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t font-semibold text-red-600">
                    <span>Total Deductions</span>
                    <span>LKR {selectedPayslip.totalDeductions?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Employer Contributions */}
              {(selectedPayslip.epfEmployer > 0 || selectedPayslip.etf > 0) && (
                <div>
                  <h3 className="font-semibold mb-3 text-[#0C397A]">Employer Contributions</h3>
                  <div className="space-y-2 text-sm">
                    {selectedPayslip.epfEmployer > 0 && (
                      <div className="flex justify-between">
                        <span>EPF Employer ({selectedPayslip.epfEmployerRate || 12}%)</span>
                        <span className="font-medium text-blue-600">LKR {selectedPayslip.epfEmployer?.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedPayslip.etf > 0 && (
                      <div className="flex justify-between">
                        <span>ETF ({selectedPayslip.etfRate || 3}%)</span>
                        <span className="font-medium text-blue-600">LKR {selectedPayslip.etf?.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Net Salary */}
              <div className="p-4 rounded-lg bg-[#F1FDF9]">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-[#0C397A]">Net Salary</span>
                  <span className="text-2xl font-bold text-[#02C39A]">
                    LKR {selectedPayslip.netSalary?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => downloadPayslipPDF(selectedPayslip)}
                  className="px-6 py-2 bg-[#02C39A] text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>
  
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
