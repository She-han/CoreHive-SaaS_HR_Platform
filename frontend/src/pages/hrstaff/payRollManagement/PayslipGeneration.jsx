import { useState, useEffect } from 'react';
import { FaFileExcel, FaFileCsv, FaDownload, FaSearch, FaCheckCircle } from 'react-icons/fa';
import * as payrollApi from '../../../api/payrollApi';
import departmentApi from '../../../api/departmentApi';
import employeeApi from '../../../api/employeeApi';

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
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');

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
      showAlert('error', 'Failed to load reference data');
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleGeneratePayslips = async () => {
    if (!month || !year) {
      showAlert('error', 'Please select month and year');
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
            showAlert('error', 'Please select a department');
            return;
          }
          response = await payrollApi.generatePayslipsByDepartment(filterValue, month, year);
          break;
        case 'designation':
          if (!filterValue) {
            showAlert('error', 'Please select a designation');
            return;
          }
          response = await payrollApi.generatePayslipsByDesignation(filterValue, month, year);
          break;
        case 'employee':
          if (!filterValue) {
            showAlert('error', 'Please select an employee');
            return;
          }
          response = await payrollApi.generatePayslipForEmployee(filterValue, month, year);
          // Convert single payslip to array
          response = { data: [response.data] };
          break;
        default:
          showAlert('error', 'Invalid filter type');
          return;
      }

      showAlert('success', `Payslips generated successfully for ${response.data.length} employee(s)`);
      loadPayslips();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to generate payslips');
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
      }
      
      const response = await payrollApi.getPayslips(month, year, filters);
      setPayslips(response.data);
    } catch (error) {
      showAlert('error', 'Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const blob = await payrollApi.exportPayslipsToExcel(month, year);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslips_${month}_${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showAlert('success', 'Payslips exported to Excel successfully');
    } catch (error) {
      showAlert('error', 'Failed to export to Excel');
    } finally {
      setLoading(false);
    }
  };

  const handleExportBankTransfer = async () => {
    setLoading(true);
    try {
      const blob = await payrollApi.exportBankTransferFile(month, year);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bank_transfer_${month}_${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showAlert('success', 'Bank transfer file exported successfully');
    } catch (error) {
      showAlert('error', 'Failed to export bank transfer file');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payslip Generation</h1>
        <p className="text-gray-600">Generate and manage employee payslips</p>
      </div>

      {/* Alert */}
      {alert.show && (
        <div className={`mb-4 p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {alert.message}
        </div>
      )}

      {/* Generation Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Generate Payslips</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

        <div className="flex gap-3">
          <button
            onClick={handleGeneratePayslips}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FaCheckCircle /> {loading ? 'Generating...' : 'Generate Payslips'}
          </button>
          
          <button
            onClick={loadPayslips}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <FaSearch /> Load Existing Payslips
          </button>
        </div>
      </div>

      {/* Export Options */}
      {payslips.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Export Options</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportExcel}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <FaFileExcel /> Export All Payslips (Excel)
            </button>
            
            <button
              onClick={handleExportBankTransfer}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <FaDownload /> Export Bank Transfer File
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Bank transfer file contains employee account numbers and net salaries for direct bank upload.
          </p>
        </div>
      )}

      {/* Payslips Table */}
      {payslips.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Allowances</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Gross</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Deductions</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Net Salary</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
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
                    <td className="px-4 py-3 text-sm text-right text-green-600">
                      +{payslip.totalAllowances?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {payslip.grossSalary?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">
                      -{payslip.totalDeductions?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">
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
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-right">TOTAL:</td>
                  <td className="px-4 py-3 text-right">
                    LKR {filteredPayslips.reduce((sum, p) => sum + (p.basicSalary || 0), 0).toFixed(2)}
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
                  <td className="px-4 py-3 text-right text-blue-600">
                    LKR {filteredPayslips.reduce((sum, p) => sum + (p.netSalary || 0), 0).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {payslips.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No payslips found. Generate payslips to view them here.</p>
        </div>
      )}
    </div>
  );
};

export default PayslipGeneration;