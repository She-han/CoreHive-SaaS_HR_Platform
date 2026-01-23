import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import * as payrollApi from '../../api/payrollApi';
import departmentApi from '../../api/departmentApi';
import employeeApi from '../../api/employeeApi';
import DashboardLayout from '../../components/layout/DashboardLayout';

const PayrollConfiguration = () => {
  const [activeTab, setActiveTab] = useState('configuration');
  const [config, setConfig] = useState(null);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    allowanceType: 'ALL_EMPLOYEES',
    deductionType: 'ALL_EMPLOYEES',
    departmentId: '',
    designation: '',
    employeeId: '',
    isPercentage: false
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'configuration') {
        const configResponse = await payrollApi.getPayrollConfiguration();
        setConfig(configResponse.data);
      } else if (activeTab === 'allowances') {
        const allowancesResponse = await payrollApi.getAllAllowances();
        setAllowances(allowancesResponse.data);
      } else if (activeTab === 'deductions') {
        const deductionsResponse = await payrollApi.getAllDeductions();
        setDeductions(deductionsResponse.data);
      }

      // Load reference data
      const [deptResponse, empResponse] = await Promise.all([
        departmentApi.getAllDepartments(),
        employeeApi.getAllEmployees(0, 1000)
      ]);
      setDepartments(deptResponse.data);
      setEmployees(empResponse.data.items || []);
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await payrollApi.updatePayrollConfiguration(config);
      showAlert('success', 'Configuration updated successfully');
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      setFormData({
        name: item.name,
        amount: item.amount,
        allowanceType: item.allowanceType || 'ALL_EMPLOYEES',
        deductionType: item.deductionType || 'ALL_EMPLOYEES',
        departmentId: item.departmentId || '',
        designation: item.designation || '',
        employeeId: item.employeeId || '',
        isPercentage: item.isPercentage || false
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        allowanceType: 'ALL_EMPLOYEES',
        deductionType: 'ALL_EMPLOYEES',
        departmentId: '',
        designation: '',
        employeeId: '',
        isPercentage: false
      });
    }
    setShowModal(true);
  };

  const handleSubmitAllowanceDeduction = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        isPercentage: formData.isPercentage,
        departmentId: formData.departmentId || null,
        designation: formData.designation || null,
        employeeId: formData.employeeId || null
      };

      if (modalType === 'allowance' || modalType === 'editAllowance') {
        data.allowanceType = formData.allowanceType;
        if (editingItem) {
          await payrollApi.updateAllowance(editingItem.id, data);
        } else {
          await payrollApi.createAllowance(data);
        }
      } else {
        data.deductionType = formData.deductionType;
        if (editingItem) {
          await payrollApi.updateDeduction(editingItem.id, data);
        } else {
          await payrollApi.createDeduction(data);
        }
      }

      showAlert('success', `${modalType.includes('allowance') ? 'Allowance' : 'Deduction'} ${editingItem ? 'updated' : 'created'} successfully`);
      setShowModal(false);
      loadData();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    setLoading(true);
    try {
      if (type === 'allowance') {
        await payrollApi.deleteAllowance(id);
      } else {
        await payrollApi.deleteDeduction(id);
      }
      showAlert('success', `${type} deleted successfully`);
      loadData();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const getApplicableText = (item) => {
    const type = item.allowanceType || item.deductionType;
    if (type === 'ALL_EMPLOYEES') return 'All Employees';
    if (type === 'DEPARTMENT_WISE') {
      const dept = departments.find(d => d.id === item.departmentId);
      return `Department: ${dept?.name || 'Unknown'}`;
    }
    if (type === 'DESIGNATION_WISE') return `Designation: ${item.designation}`;
    if (type === 'EMPLOYEE_SPECIFIC') {
      const emp = employees.find(e => e.id === item.employeeId);
      return `Employee: ${emp?.firstName} ${emp?.lastName}`;
    }
    return 'N/A';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payroll Configuration</h1>
          <p className="text-gray-600">Configure salary components, allowances, and deductions</p>
        </div>

        {/* Alert */}
        {alert.show && (
          <div className={`mb-4 p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {alert.message}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            {['configuration', 'allowances', 'deductions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Configuration Tab */}
            {activeTab === 'configuration' && config && (
              <form onSubmit={handleConfigSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* OT Configuration */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4 text-blue-800">Overtime Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          OT Rate Per Hour (LKR)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={config.otRatePerHour || ''}
                          onChange={(e) => setConfig({...config, otRatePerHour: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          OT Multiplier (e.g., 1.5x)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={config.otMultiplier || 1.5}
                          onChange={(e) => setConfig({...config, otMultiplier: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* EPF/ETF Configuration */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4 text-green-800">EPF/ETF Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          EPF Employer (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={config.epfEmployerPercentage || 12}
                          onChange={(e) => setConfig({...config, epfEmployerPercentage: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          EPF Employee (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={config.epfEmployeePercentage || 8}
                          onChange={(e) => setConfig({...config, epfEmployeePercentage: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ETF (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={config.etfPercentage || 3}
                          onChange={(e) => setConfig({...config, etfPercentage: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tax Configuration */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4 text-purple-800">Tax Configuration</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Deduction (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.taxPercentage || 0}
                        onChange={(e) => setConfig({...config, taxPercentage: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <FaSave /> {loading ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            )}

            {/* Allowances Tab */}
            {activeTab === 'allowances' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Allowances</h3>
                  <button
                    onClick={() => handleOpenModal('allowance')}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <FaPlus /> Add Allowance
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Applicable To</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allowances.map((allowance) => (
                        <tr key={allowance.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{allowance.name}</td>
                          <td className="px-4 py-3">
                            {allowance.isPercentage ? `${allowance.amount}%` : `LKR ${allowance.amount}`}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              {allowance.isPercentage ? 'Percentage' : 'Fixed'}
                            </span>
                          </td>
                          <td className="px-4 py-3">{getApplicableText(allowance)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenModal('editAllowance', allowance)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete('allowance', allowance.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Deductions Tab */}
            {activeTab === 'deductions' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Deductions</h3>
                  <button
                    onClick={() => handleOpenModal('deduction')}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <FaPlus /> Add Deduction
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Applicable To</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {deductions.map((deduction) => (
                        <tr key={deduction.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{deduction.name}</td>
                          <td className="px-4 py-3">
                            {deduction.isPercentage ? `${deduction.amount}%` : `LKR ${deduction.amount}`}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                              {deduction.isPercentage ? 'Percentage' : 'Fixed'}
                            </span>
                          </td>
                          <td className="px-4 py-3">{getApplicableText(deduction)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenModal('editDeduction', deduction)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete('deduction', deduction.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal for Allowance/Deduction */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {editingItem ? 'Edit' : 'Add'} {modalType.includes('allowance') ? 'Allowance' : 'Deduction'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitAllowanceDeduction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Transport Allowance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPercentage}
                    onChange={(e) => setFormData({...formData, isPercentage: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700">Is Percentage of Basic Salary</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apply To *</label>
                  <select
                    value={modalType.includes('allowance') ? formData.allowanceType : formData.deductionType}
                    onChange={(e) => {
                      const key = modalType.includes('allowance') ? 'allowanceType' : 'deductionType';
                      setFormData({...formData, [key]: e.target.value, departmentId: '', designation: '', employeeId: ''});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL_EMPLOYEES">All Employees</option>
                    <option value="DEPARTMENT_WISE">Department Wise</option>
                    <option value="DESIGNATION_WISE">Designation Wise</option>
                    <option value="EMPLOYEE_SPECIFIC">Specific Employee</option>
                  </select>
                </div>

                {(formData.allowanceType === 'DEPARTMENT_WISE' || formData.deductionType === 'DEPARTMENT_WISE') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select
                      required
                      value={formData.departmentId}
                      onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(formData.allowanceType === 'DESIGNATION_WISE' || formData.deductionType === 'DESIGNATION_WISE') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                    <input
                      type="text"
                      required
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Manager"
                    />
                  </div>
                )}

                {(formData.allowanceType === 'EMPLOYEE_SPECIFIC' || formData.deductionType === 'EMPLOYEE_SPECIFIC') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                    <select
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeCode})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PayrollConfiguration;