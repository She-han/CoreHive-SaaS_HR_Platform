import axios from './axios';

// ==================== PAYROLL CONFIGURATION (ORG_ADMIN) ====================

export const getPayrollConfiguration = async () => {
  const response = await axios.get('/org-admin/payroll-config/configuration');
  return response.data;
};

export const updatePayrollConfiguration = async (configData) => {
  const response = await axios.put('/org-admin/payroll-config/configuration', configData);
  return response.data;
};

// ==================== ALLOWANCES ====================

export const getAllAllowances = async () => {
  const response = await axios.get('/org-admin/payroll-config/allowances');
  return response.data;
};

export const createAllowance = async (allowanceData) => {
  const response = await axios.post('/org-admin/payroll-config/allowances', allowanceData);
  return response.data;
};

export const updateAllowance = async (id, allowanceData) => {
  const response = await axios.put(`/org-admin/payroll-config/allowances/${id}`, allowanceData);
  return response.data;
};

export const deleteAllowance = async (id) => {
  const response = await axios.delete(`/org-admin/payroll-config/allowances/${id}`);
  return response.data;
};

// ==================== DEDUCTIONS ====================

export const getAllDeductions = async () => {
  const response = await axios.get('/org-admin/payroll-config/deductions');
  return response.data;
};

export const createDeduction = async (deductionData) => {
  const response = await axios.post('/org-admin/payroll-config/deductions', deductionData);
  return response.data;
};

export const updateDeduction = async (id, deductionData) => {
  const response = await axios.put(`/org-admin/payroll-config/deductions/${id}`, deductionData);
  return response.data;
};

export const deleteDeduction = async (id) => {
  const response = await axios.delete(`/org-admin/payroll-config/deductions/${id}`);
  return response.data;
};

// ==================== PAYSLIPS (HR_STAFF) ====================

export const generatePayslipsForAll = async (month, year) => {
  const response = await axios.post(`/hr-staff/payslips/generate/all?month=${month}&year=${year}`);
  return response.data;
};

export const generatePayslipsByDepartment = async (departmentId, month, year) => {
  const response = await axios.post(`/hr-staff/payslips/generate/department/${departmentId}?month=${month}&year=${year}`);
  return response.data;
};

export const generatePayslipsByDesignation = async (designation, month, year) => {
  const response = await axios.post(`/hr-staff/payslips/generate/designation?designation=${designation}&month=${month}&year=${year}`);
  return response.data;
};

export const generatePayslipForEmployee = async (employeeId, month, year) => {
  const response = await axios.post(`/hr-staff/payslips/generate/employee/${employeeId}?month=${month}&year=${year}`);
  return response.data;
};

export const getPayslips = async (month, year, filters = {}) => {
  let url = `/hr-staff/payslips?month=${month}&year=${year}`;
  
  if (filters.departmentName) {
    url += `&departmentName=${encodeURIComponent(filters.departmentName)}`;
  }
  
  if (filters.designation) {
    url += `&designation=${encodeURIComponent(filters.designation)}`;
  }
  
  const response = await axios.get(url);
  return response.data;
};

export const exportPayslipsToExcel = async (month, year, filters = {}) => {
  const params = new URLSearchParams({ month, year, ...filters });
  const response = await axios.get(`/hr-staff/payslips/export/excel?${params}`, {
    responseType: 'blob'
  });
  return response.data;
};

export const exportBankTransferFile = async (month, year, filters = {}) => {
  const params = new URLSearchParams({ month, year, ...filters });
  const response = await axios.get(`/hr-staff/payslips/export/bank-transfer?${params}`, {
    responseType: 'blob'
  });
  return response.data;
};

export default {
  getPayrollConfiguration,
  updatePayrollConfiguration,
  getAllAllowances,
  createAllowance,
  updateAllowance,
  deleteAllowance,
  getAllDeductions,
  createDeduction,
  updateDeduction,
  deleteDeduction,
  generatePayslipsForAll,
  generatePayslipsByDepartment,
  generatePayslipsByDesignation,
  generatePayslipForEmployee,
  getPayslips,
  exportPayslipsToExcel,
  exportBankTransferFile
};
