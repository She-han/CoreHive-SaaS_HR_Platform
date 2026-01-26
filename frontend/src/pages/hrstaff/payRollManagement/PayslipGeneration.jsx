import { useState, useEffect } from 'react';
import { FaFileExcel, FaFileCsv, FaDownload, FaSearch, FaCheckCircle, FaFilePdf, FaEye, FaCheck } from 'react-icons/fa';
import * as payrollApi from '../../../api/payrollApi';
import departmentApi from '../../../api/departmentApi';
import employeeApi from '../../../api/employeeApi';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';

const PayslipGeneration = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [payslips, setPayslips] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Theme colors matching HRStaffManagement
  const THEME = {
    primary: "#02C39A",
    secondary: "#05668D",
    dark: "#0C397A",
    background: "#F1FDF9",
    success: "#1ED292",
    text: "#333333",
    muted: "#9B9B9B"
  };

  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      const [deptResponse, empResponse] = await Promise.all([
        departmentApi.getAllDepartments(),
        employeeApi.getAllEmployees(0, 1000)
      ]);
      
      setDepartments(deptResponse.data);
      const empData = empResponse.data.items || [];
      setEmployees(empData);
      
      // Extract unique designations
      const uniqueDesignations = [...new Set(empData.map(e => e.designation).filter(Boolean))];
      setDesignations(uniqueDesignations);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load reference data',
        confirmButtonColor: THEME.primary
      });
    }
  };

  const handleGeneratePayslips = async () => {
    if (!month || !year) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select month and year',
        confirmButtonColor: THEME.primary
      });
      return;
    }

    setLoading(true);
    try {
      let response;
      
      switch (filterType) {
        case 'all':
          response = await payrollApi.generatePayslipsForAll(month, year);
          break;
        case 'department':
          if (!filterValue) {
            Swal.fire({
              icon: 'warning',
              title: 'Missing Information',
              text: 'Please select a department',
              confirmButtonColor: THEME.primary
            });
            return;
          }
          response = await payrollApi.generatePayslipsByDepartment(filterValue, month, year);
          break;
        case 'designation':
          if (!filterValue) {
            Swal.fire({
              icon: 'warning',
              title: 'Missing Information',
              text: 'Please select a designation',
              confirmButtonColor: THEME.primary
            });
            return;
          }
          response = await payrollApi.generatePayslipsByDesignation(filterValue, month, year);
          break;
        case 'employee':
          if (!filterValue) {
            Swal.fire({
              icon: 'warning',
              title: 'Missing Information',
              text: 'Please select an employee',
              confirmButtonColor: THEME.primary
            });
            return;
          }
          response = await payrollApi.generatePayslipForEmployee(filterValue, month, year);
          // Convert single payslip to array and set directly
          setPayslips([response.data]);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Payslip generated successfully for 1 employee',
            confirmButtonColor: THEME.primary
          });
          return; // Return early to avoid calling loadPayslips
        default:
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Invalid filter type',
            confirmButtonColor: THEME.primary
          });
          return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Payslips generated successfully for ${response.data.length} employee(s)`,
        confirmButtonColor: THEME.primary
      });
      loadPayslips();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Generation Failed',
        text: error.response?.data?.message || 'Failed to generate payslips',
        confirmButtonColor: THEME.primary
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPayslips = async () => {
    if (!month || !year) return;
    
    setLoading(true);
    try {
      const filters = {};
      
      if (filterType === 'department' && filterValue) {
        const dept = departments.find(d => d.id === parseInt(filterValue));
        filters.departmentName = dept?.name;
      } else if (filterType === 'designation' && filterValue) {
        filters.designation = filterValue;
      } else if (filterType === 'employee' && filterValue) {
        const emp = employees.find(e => e.id === parseInt(filterValue));
        if (emp) {
          filters.employeeCode = emp.employeeCode;
        }
      }
      
      const response = await payrollApi.getPayslips(month, year, filters);
      setPayslips(response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load payslips',
        confirmButtonColor: THEME.primary
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const filters = {};
      
      if (filterType === 'department' && filterValue) {
        const dept = departments.find(d => d.id === parseInt(filterValue));
        filters.departmentName = dept?.name;
      } else if (filterType === 'designation' && filterValue) {
        filters.designation = filterValue;
      } else if (filterType === 'employee' && filterValue) {
        const emp = employees.find(e => e.id === parseInt(filterValue));
        if (emp) {
          filters.employeeCode = emp.employeeCode;
        }
      }
      
      const blob = await payrollApi.exportPayslipsToExcel(month, year, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslips_${month}_${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Payslips exported to Excel successfully',
        confirmButtonColor: THEME.primary
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Failed to export to Excel',
        confirmButtonColor: THEME.primary
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportBankTransfer = async () => {
    setLoading(true);
    try {
      const filters = {};
      
      if (filterType === 'department' && filterValue) {
        const dept = departments.find(d => d.id === parseInt(filterValue));
        filters.departmentName = dept?.name;
      } else if (filterType === 'designation' && filterValue) {
        filters.designation = filterValue;
      } else if (filterType === 'employee' && filterValue) {
        const emp = employees.find(e => e.id === parseInt(filterValue));
        if (emp) {
          filters.employeeCode = emp.employeeCode;
        }
      }
      
      const blob = await payrollApi.exportBankTransferFile(month, year, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bank_transfer_${month}_${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Bank transfer file exported successfully',
        confirmButtonColor: THEME.primary
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Failed to export bank transfer file',
        confirmButtonColor: THEME.primary
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setIsViewModalOpen(true);
  };

  const handleApprovePayslip = async (payslipId) => {
    try {
      setLoading(true);
      await payrollApi.approvePayslip(payslipId);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Payslip approved successfully',
        confirmButtonColor: THEME.primary
      });
      // Refresh payslips
      await loadPayslips();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: error.response?.data?.message || 'Failed to approve payslip',
        confirmButtonColor: THEME.primary
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAll = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      if (filterType === 'department' && filterValue) {
        const dept = departments.find(d => d.id === parseInt(filterValue));
        filters.departmentName = dept?.name;
      } else if (filterType === 'designation' && filterValue) {
        filters.designation = filterValue;
      } else if (filterType === 'employee' && filterValue) {
        const emp = employees.find(e => e.id === parseInt(filterValue));
        if (emp) {
          filters.employeeCode = emp.employeeCode;
        }
      }
      
      const result = await payrollApi.approveAllPayslips(month, year, filters);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `${result.data.approvedCount || 'All'} payslip(s) approved successfully`,
        confirmButtonColor: THEME.primary
      });
      // Refresh payslips
      await loadPayslips();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: error.response?.data?.message || 'Failed to approve payslips',
        confirmButtonColor: THEME.primary
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePayslipPDF = (payslip) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Header with gradient effect (simulated with rectangles)
    doc.setFillColor(2, 195, 154); // Primary color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text(payslip.companyName || 'Company Name', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`${months[month - 1]} ${year}`, pageWidth / 2, 30, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Employee Details Section
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
    
    // Earnings Section
    yPos += 5;
    doc.setFillColor(245, 247, 250);
    doc.rect(10, yPos - 5, pageWidth - 20, 8, 'F');
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('EARNINGS', 14, yPos);
    yPos += 10;
    
    const earningsData = [
      ['Basic Salary', `LKR ${(payslip.basicSalary || 0).toFixed(2)}`],
    ];
    
    // Add OT Pay if exists
    if (payslip.otPay && payslip.otPay > 0) {
      earningsData.push(['OT Pay', `LKR ${payslip.otPay.toFixed(2)}`]);
    }
    
    // Add allowances breakdown
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
    
    // Deductions Section
    doc.setFillColor(245, 247, 250);
    doc.rect(10, yPos - 5, pageWidth - 20, 8, 'F');
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('DEDUCTIONS', 14, yPos);
    yPos += 10;
    
    const deductionsData = [];
    
    // Add EPF Employee
    if (payslip.epfEmployee && payslip.epfEmployee > 0) {
      deductionsData.push([`EPF Employee (${payslip.epfEmployeeRate || 8}%)`, `LKR ${payslip.epfEmployee.toFixed(2)}`]);
    }
    
    // Add Tax
    if (payslip.tax && payslip.tax > 0) {
      deductionsData.push([`Tax (${payslip.taxRate || 0}%)`, `LKR ${payslip.tax.toFixed(2)}`]);
    }
    
    // Add deductions breakdown
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
    
    // Add net salary as a regular row first
    doc.setFillColor(245, 247, 250);
    doc.rect(10, yPos, pageWidth - 20, 8, 'F');
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Net Salary', 14, yPos + 6);
    doc.text(`LKR ${(payslip.netSalary || 0).toFixed(2)}`, pageWidth - 14, yPos + 6, { align: 'right' });
    yPos += 15;
    
    // Net Salary (highlighted) - Extra section at bottom
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
    
    // Save the PDF
    doc.save(`Payslip_${payslip.employeeCode}_${months[month - 1]}_${year}.pdf`);
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Payslip downloaded successfully',
      confirmButtonColor: THEME.primary,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const filteredPayslips = payslips.filter(payslip => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      payslip.employeeName?.toLowerCase().includes(search) ||
      payslip.employeeCode?.toLowerCase().includes(search) ||
      payslip.designation?.toLowerCase().includes(search) ||
      payslip.departmentName?.toLowerCase().includes(search)
    );
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  return (
    <div>
      <div className="p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row p-6 justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: THEME.dark }}>
              Payslip Generation
            </h1>
            <p className="text-gray-600 mt-1">
              Generate and manage employee payslips
            </p>
          </div>
        </div>


      {/* Generation Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 mx-5">
          <h2 className="text-xl font-semibold mb-4" style={{ color: THEME.dark }}>Generate Payslips</h2>
          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
            >
              {months.map((m, idx) => (
                <option key={idx} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ outlineColor: THEME.primary }}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Filter Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Generate For</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterValue('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ outlineColor: THEME.primary }}
            >
              <option value="all">All Employees</option>
              <option value="department">By Department</option>
              <option value="designation">By Designation</option>
              <option value="employee">Specific Employee</option>
            </select>
          </div>

          {/* Filter Value */}
          {filterType !== 'all' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select {filterType === 'department' ? 'Department' : filterType === 'designation' ? 'Designation' : 'Employee'}
              </label>
              {filterType === 'department' && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ outlineColor: THEME.primary }}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              )}
              {filterType === 'designation' && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ outlineColor: THEME.primary }}
                >
                  <option value="">Select Designation</option>
                  {designations.map(designation => (
                    <option key={designation} value={designation}>{designation}</option>
                  ))}
                </select>
              )}
              {filterType === 'employee' && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ outlineColor: THEME.primary }}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mx-5 justify-end mb-6">
          <button
            onClick={handleGeneratePayslips}
            disabled={loading}
            style={{ backgroundColor: THEME.primary }}
            className="flex items-center gap-2 text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <FaCheckCircle /> {loading ? 'Generating...' : 'Generate Payslips'}
          </button>
          
          <button
            onClick={loadPayslips}
            disabled={loading}
            style={{ backgroundColor: THEME.secondary }}
            className="flex items-center gap-2 text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <FaSearch /> Load Existing Payslips
          </button>
        </div>
      </div>

 

      {/* Payslips Table */}
      {payslips.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mx-8 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Payslips for {months[month - 1]} {year} ({filteredPayslips.length})
            </h2>
            
            <div className="w-64">
              <input
                type="text"
                placeholder="Search payslips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ outlineColor: THEME.primary }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Designation</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Basic Salary</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">OT Hours</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">OT Pay</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Allowances</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Gross</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Deductions</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Net Salary</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayslips.map((payslip) => (
                  <tr key={payslip.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{payslip.employeeCode}</td>
                    <td className="px-4 py-3 text-sm font-medium">{payslip.employeeName}</td>
                    <td className="px-4 py-3 text-sm">{payslip.designation}</td>
                    <td className="px-4 py-3 text-sm">{payslip.departmentName}</td>
                    <td className="px-4 py-3 text-sm text-right">LKR {payslip.basicSalary?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right">{payslip.otHours?.toFixed(2) || '0.00'} hrs</td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600">
                      +{payslip.otPay?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">
                      +{payslip.totalAllowances?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {payslip.grossSalary?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">
                      -{payslip.totalDeductions?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold" style={{ color: THEME.primary }}>
                      LKR {payslip.netSalary?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        payslip.status === 'GENERATED' ? 'bg-green-100 text-green-800' :
                        payslip.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                        payslip.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {payslip.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleViewPayslip(payslip)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View Details"
                        >
                          <FaEye size={18} />
                        </button>
                        <button
                          onClick={() => generatePayslipPDF(payslip)}
                          className="p-1"
                          style={{ color: THEME.primary }}
                          title="Download PDF"
                          onMouseEnter={(e) => e.currentTarget.style.color = THEME.success}
                          onMouseLeave={(e) => e.currentTarget.style.color = THEME.primary}
                        >
                          <FaFilePdf size={18} />
                        </button>
                        {payslip.status === 'GENERATED' && (
                          <button
                            onClick={() => handleApprovePayslip(payslip.id)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Approve Payslip"
                            disabled={loading}
                          >
                            <FaCheck size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-right">TOTAL:</td>
                  <td className="px-4 py-3 text-right">
                    LKR {filteredPayslips.reduce((sum, p) => sum + (p.basicSalary || 0), 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {filteredPayslips.reduce((sum, p) => sum + (p.otHours || 0), 0).toFixed(2)} hrs
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600">
                    +{filteredPayslips.reduce((sum, p) => sum + (p.otPay || 0), 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">
                    +{filteredPayslips.reduce((sum, p) => sum + (p.totalAllowances || 0), 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {filteredPayslips.reduce((sum, p) => sum + (p.grossSalary || 0), 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    -{filteredPayslips.reduce((sum, p) => sum + (p.totalDeductions || 0), 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: THEME.primary }}>
                    LKR {filteredPayslips.reduce((sum, p) => sum + (p.netSalary || 0), 0).toFixed(2)}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Approve All Button */}
          {filteredPayslips.some(p => p.status === 'GENERATED') && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleApproveAll}
                disabled={loading}
                style={{ backgroundColor: THEME.success }}
                className="flex items-center gap-2 text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <FaCheckCircle /> {loading ? 'Approving...' : 'Approve All Generated Payslips'}
              </button>
            </div>
          )}
        </div>
      )}

      {payslips.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No payslips found. Generate payslips to view them here.</p>
        </div>
      )}

           {/* Export Options */}
      {payslips.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 mx-8">
          <h2 className="text-xl font-semibold mb-4">Export Options</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportExcel}
              disabled={loading}
              style={{ backgroundColor: THEME.success }}
              className="flex items-center gap-2 text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <FaFileExcel /> Export Payslips (Excel)
            </button>
            
            <button
              onClick={handleExportBankTransfer}
              disabled={loading}
              style={{ backgroundColor: THEME.secondary }}
              className="flex items-center gap-2 text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <FaDownload /> Export Bank Transfer File
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Bank transfer file contains employee account numbers and net salaries for direct bank upload.
          </p>
        </div>
      )}

      {/* View Payslip Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPayslip(null);
        }}
        title={`Payslip Details - ${selectedPayslip?.employeeName || ''}`}
      >
        {selectedPayslip && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3" style={{ color: THEME.dark }}>Employee Information</h3>
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
                  <p className="font-medium">{months[month - 1]} {year}</p>
                </div>
              </div>
            </div>

            {/* Earnings */}
            <div>
              <h3 className="font-semibold mb-3" style={{ color: THEME.dark }}>Earnings</h3>
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
              <h3 className="font-semibold mb-3" style={{ color: THEME.dark }}>Deductions</h3>
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
                <h3 className="font-semibold mb-3" style={{ color: THEME.dark }}>Employer Contributions</h3>
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
            <div className="p-4 rounded-lg" style={{ backgroundColor: THEME.background }}>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold" style={{ color: THEME.dark }}>Net Salary</span>
                <span className="text-2xl font-bold" style={{ color: THEME.primary }}>
                  LKR {selectedPayslip.netSalary?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => generatePayslipPDF(selectedPayslip)}
                className="flex items-center gap-2"
              >
                <FaFilePdf /> Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PayslipGeneration;