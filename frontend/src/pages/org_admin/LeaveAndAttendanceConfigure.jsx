import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import * as leaveTypeApi from '../../api/leaveTypeApi';
import * as attendanceConfigApi from '../../api/attendanceConfigApi';
import * as departmentApi from '../../api/departmentApi';
import * as designationApi from '../../api/designationApi';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import DashboardLayout from '../../components/layout/DashboardLayout';

const LeaveAndAttendanceConfigure = () => {
  const [activeTab, setActiveTab] = useState('leaveTypes');
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [attendanceConfig, setAttendanceConfig] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditingAttendance, setIsEditingAttendance] = useState(false);

  // Theme colors matching HRStaffManagement
  const THEME = {
    primary: "#02C39A",
    secondary: "#05668D",
    dark: "#0C397A",
    background: "#F1FDF9",
    success: "#1ED292"
  };

  const [leaveTypeForm, setLeaveTypeForm] = useState({
    name: '',
    code: '',
    defaultDaysPerYear: 0,
    requiresApproval: true
  });

  const [attendanceForm, setAttendanceForm] = useState({
    name: '',
    workStartTime: '09:00',
    workEndTime: '17:00',
    lateThreshold: '09:30',
    eveningHalfDayThreshold: '13:00',
    absentThreshold: '15:00',
    morningHalfDayThreshold: '14:00',
    otStartTime: '18:00',
    leaveDeductionAmount: 0,
    applicationType: 'ALL_EMPLOYEES',
    departmentId: null,
    designation: ''
  });

  useEffect(() => {
    loadData();
    loadDepartments();
    loadDesignations();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'leaveTypes') {
        const response = await leaveTypeApi.getAllLeaveTypes();
        setLeaveTypes(response.data || []);
      } else {
        const response = await attendanceConfigApi.getAllConfigurations();
        const configs = response.data || [];
        if (configs.length > 0) {
          setAttendanceConfig(configs[0]);
          setAttendanceForm(configs[0]);
        } else {
          setAttendanceConfig(null);
        }
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to load data'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentApi.getAllDepartments();
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadDesignations = async () => {
    try {
      const response = await designationApi.getAllDesignations();
      setDesignations(response.data || []);
    } catch (error) {
      console.error('Error loading designations:', error);
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setLeaveTypeForm({
        name: item.name,
        code: item.code,
        defaultDaysPerYear: item.defaultDaysPerYear,
        requiresApproval: item.requiresApproval
      });
    } else {
      setLeaveTypeForm({
        name: '',
        code: '',
        defaultDaysPerYear: 0,
        requiresApproval: true
      });
    }
    setShowModal(true);
  };

  const handleSubmitLeaveType = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        await leaveTypeApi.updateLeaveType(editingItem.id, leaveTypeForm);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Leave type updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await leaveTypeApi.createLeaveType(leaveTypeForm);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Leave type created successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Operation failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAttendanceConfig = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...attendanceForm };

      if (data.applicationType === 'ALL_EMPLOYEES') {
        data.departmentId = null;
        data.designation = null;
      } else if (data.applicationType === 'DEPARTMENT_WISE') {
        data.designation = null;
      } else if (data.applicationType === 'DESIGNATION_WISE') {
        data.departmentId = null;
      }

      if (attendanceConfig && attendanceConfig.id) {
        await attendanceConfigApi.updateConfiguration(attendanceConfig.id, data);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Configuration updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await attendanceConfigApi.createConfiguration(data);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Configuration created successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      setIsEditingAttendance(false);
      loadData();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Operation failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this leave type?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#02C39A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await leaveTypeApi.deleteLeaveType(id);
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Leave type deleted successfully',
        timer: 2000,
        showConfirmButton: false
      });
      loadData();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationTypeChange = (type) => {
    setAttendanceForm({ ...attendanceForm, applicationType: type });
  };

  const handleCancelEdit = () => {
    if (attendanceConfig) {
      setAttendanceForm(attendanceConfig);
    }
    setIsEditingAttendance(false);
  };

  return (
  
      <div className="min-h-screen bg-gradient-to-br from-[#F1FDF9] to-white p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0C397A] mb-2">Leave & Attendance Configuration</h1>
          <p className="text-gray-600">Manage leave types and attendance rules for your organization</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('leaveTypes')}
              className={`px-6 py-4 font-medium ${activeTab === 'leaveTypes' ? 'border-b-2 border-[#02C39A] text-[#02C39A]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Leave Types
            </button>
            <button
              onClick={() => setActiveTab('attendanceSettings')}
              className={`px-6 py-4 font-medium ${activeTab === 'attendanceSettings' ? 'border-b-2 border-[#02C39A] text-[#02C39A]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Attendance Settings
            </button>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'leaveTypes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#0C397A]">Leave Types</h2>
                <button
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2 bg-[#02C39A] text-white px-4 py-2 rounded-lg hover:bg-[#1ED292] transition"
                  disabled={loading}
                >
                  <FaPlus /> Add Leave Type
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default no of days/year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requires Approval</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                      </tr>
                    ) : leaveTypes.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No leave types found</td>
                      </tr>
                    ) : (
                      leaveTypes.map((type) => (
                        <tr key={type.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{type.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type.code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type.defaultDaysPerYear}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {type.requiresApproval ? 'Yes' : 'No'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleOpenModal(type)}
                              className="text-[#05668D] hover:text-[#0C397A] mr-3"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(type.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'attendanceSettings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#0C397A]">Attendance Configuration</h2>
                {!isEditingAttendance && attendanceConfig && (
                  <button
                    onClick={() => setIsEditingAttendance(true)}
                    className="flex items-center gap-2 bg-[#05668D] text-white px-4 py-2 rounded-lg hover:bg-[#0C397A] transition"
                    disabled={loading}
                  >
                    <FaEdit /> Edit Configuration
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
              ) : (
                <form onSubmit={handleSubmitAttendanceConfig} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Configuration Name</label>
                      <input
                        type="text"
                        value={attendanceForm.name}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                        required
                        disabled={!isEditingAttendance && attendanceConfig}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Work Start Time</label>
                      <input
                        type="time"
                        value={attendanceForm.workStartTime}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, workStartTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                        required
                        disabled={!isEditingAttendance && attendanceConfig}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Work End Time</label>
                      <input
                        type="time"
                        value={attendanceForm.workEndTime}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, workEndTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                        required
                        disabled={!isEditingAttendance && attendanceConfig}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Late Threshold</label>
                      <input
                        type="time"
                        value={attendanceForm.lateThreshold}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, lateThreshold: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                        required
                        disabled={!isEditingAttendance && attendanceConfig}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Evening Half Day After</label>
                      <input
                        type="time"
                        value={attendanceForm.eveningHalfDayThreshold}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, eveningHalfDayThreshold: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                        required
                        disabled={!isEditingAttendance && attendanceConfig}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Absent After</label>
                      <input
                        type="time"
                        value={attendanceForm.absentThreshold}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, absentThreshold: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                        required
                        disabled={!isEditingAttendance && attendanceConfig}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Morning Half Day Before</label>
                      <input
                        type="time"
                        value={attendanceForm.morningHalfDayThreshold}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, morningHalfDayThreshold: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                        required
                        disabled={!isEditingAttendance && attendanceConfig}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">OT Start Time</label>
                      <input
                        type="time"
                        value={attendanceForm.otStartTime}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, otStartTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                        required
                        disabled={!isEditingAttendance && attendanceConfig}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Leave Deduction Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={attendanceForm.leaveDeductionAmount}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, leaveDeductionAmount: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                        required
                        min="0"
                        disabled={!isEditingAttendance && attendanceConfig}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apply To</label>
                      <select
                        value={attendanceForm.applicationType}
                        onChange={(e) => handleApplicationTypeChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                        required
                        disabled={!isEditingAttendance && attendanceConfig}
                      >
                        <option value="ALL_EMPLOYEES">All Employees</option>
                        <option value="DEPARTMENT_WISE">Department-wise</option>
                        <option value="DESIGNATION_WISE">Designation-wise</option>
                      </select>
                    </div>

                    {attendanceForm.applicationType === 'DEPARTMENT_WISE' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
                        <select
                          value={attendanceForm.departmentId || ''}
                          onChange={(e) => setAttendanceForm({ ...attendanceForm, departmentId: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                          required
                          disabled={!isEditingAttendance && attendanceConfig}
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {attendanceForm.applicationType === 'DESIGNATION_WISE' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Designation</label>
                        <select
                          value={attendanceForm.designation}
                          onChange={(e) => setAttendanceForm({ ...attendanceForm, designation: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                          required
                          disabled={!isEditingAttendance && attendanceConfig}
                        >
                          <option value="">Select Designation</option>
                          {designations.map((desig) => (
                            <option key={desig.id} value={desig.name}>{desig.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {(isEditingAttendance || !attendanceConfig) && (
                    <div className="flex justify-end gap-3 pt-6 border-t">
                      {attendanceConfig && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#02C39A] text-white px-6 py-2 rounded-lg hover:bg-[#1ED292] disabled:opacity-50 transition"
                      >
                        <FaSave /> {loading ? 'Saving...' : attendanceConfig ? 'Save Changes' : 'Create Configuration'}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal for Leave Types Only */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`${editingItem ? 'Edit' : 'Add'} Leave Type`}
        >
          <form onSubmit={handleSubmitLeaveType} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type Name</label>
              <input
                type="text"
                value={leaveTypeForm.name}
                onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                value={leaveTypeForm.code}
                onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Days Per Year</label>
              <input
                type="number"
                value={leaveTypeForm.defaultDaysPerYear}
                onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, defaultDaysPerYear: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                required
                min="0"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={leaveTypeForm.requiresApproval}
                onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, requiresApproval: e.target.checked })}
                className="h-4 w-4 text-[#02C39A] focus:ring-[#02C39A] border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Requires Approval</label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <FaSave /> {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
   
  );
};

export default LeaveAndAttendanceConfigure;
