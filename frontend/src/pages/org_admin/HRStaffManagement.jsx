import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  UserPlusIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BriefcaseIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/solid';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import * as hrStaffApi from '../../api/hrStaffApi';
import * as departmentApi from '../../api/departmentApi';
import DashboardLayout from '../../components/layout/DashboardLayout';

const HRStaffManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [hrStaffList, setHrStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    departmentId: '',
    basicSalary: '',
    dateOfJoining: '',
    salaryType: 'MONTHLY',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Departments state
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ref to store departments for immediate access in fetchHRStaff
  const departmentsRef = useRef([]);

  // Fetch departments first
  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const response = await departmentApi.getAllDepartments();
      
      if (response.success && response.data) {
        setDepartments(response.data);
        departmentsRef.current = response.data;
        return response.data;
      } else {
        console.error('Failed to fetch departments:', response.message);
        const fallbackDepts = [
          { id: 1, name: 'Human Resources' },
          { id: 2, name: 'Information Technology' },
          { id: 3, name: 'Finance' },
          { id: 4, name: 'Operations' }
        ];
        setDepartments(fallbackDepts);
        departmentsRef.current = fallbackDepts;
        return fallbackDepts;
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      const fallbackDepts = [
        { id: 1, name: 'Human Resources' },
        { id: 2, name: 'Information Technology' },
        { id: 3, name: 'Finance' },
        { id: 4, name: 'Operations' }
      ];
      setDepartments(fallbackDepts);
      departmentsRef.current = fallbackDepts;
      return fallbackDepts;
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // Fetch HR staff with department mapping
  const fetchHRStaff = async (deptList = null) => {
    setLoading(true);
    try {
      let response;
      
      if (searchTerm.trim()) {
        response = await hrStaffApi.searchHRStaff(
          searchTerm, 
          currentPage - 1, 
          itemsPerPage, 
          'createdAt', 
          'desc'
        );
      } else {
        response = await hrStaffApi.getAllHRStaff(
          currentPage - 1, 
          itemsPerPage, 
          'createdAt', 
          'desc'
        );
      }

      if (response.success && response.data) {
        // Use provided deptList, or ref, or state
        const availableDepts = deptList || departmentsRef.current || departments;
        
        // Transform data with departments for name resolution
        const transformedData = response.data.content?.map(staff => 
          hrStaffApi.transformHRStaffResponse(staff, availableDepts)
        ) || [];
        
        // Apply status filter on frontend
        const filteredData = transformedData.filter(staff => {
          return filterStatus === 'all' || 
            (filterStatus === 'active' && staff.isActive) ||
            (filterStatus === 'inactive' && !staff.isActive);
        });

        setHrStaffList(filteredData);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || filteredData.length);
      } else {
        throw new Error(response.message || 'Failed to fetch HR staff');
      }
    } catch (error) {
      console.error('Error fetching HR staff:', error);
      showAlert('error', error.response?.data?.message || 'Failed to fetch HR staff data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data - fetch departments first, then HR staff
  useEffect(() => {
    const initializeData = async () => {
      const deptList = await fetchDepartments();
      await fetchHRStaff(deptList);
      setIsInitialized(true);
    };
    initializeData();
  }, []);

  // Refetch HR staff when filters change (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      fetchHRStaff();
    }
  }, [currentPage, searchTerm, filterStatus]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      designation: '',
      departmentId: '',
      basicSalary: '',
      dateOfJoining: '',
      salaryType: 'MONTHLY',
      isActive: true
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const validation = hrStaffApi.validateHRStaffData(formData);
    setFormErrors(validation.errors);
    return validation.isValid;
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const apiData = hrStaffApi.formatHRStaffForAPI(formData);
      const response = await hrStaffApi.createHRStaff(apiData);
      
      if (response.success) {
        showAlert('success', 
          `HR staff member added successfully! Temporary password: ${response.data.temporaryPassword || 'TempPass123!'}`
        );
        setIsAddModalOpen(false);
        resetForm();
        fetchHRStaff();
      } else {
        throw new Error(response.message || 'Failed to create HR staff');
      }
    } catch (error) {
      console.error('Error adding HR staff:', error);
      showAlert('error', error.response?.data?.message || 'Failed to add HR staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    if (!validateForm() || !selectedStaff) return;

    setLoading(true);
    try {
      const apiData = hrStaffApi.formatHRStaffForAPI(formData);
      const response = await hrStaffApi.updateHRStaff(selectedStaff.id, apiData);
      
      if (response.success) {
        showAlert('success', 'HR staff member updated successfully!');
        setIsEditModalOpen(false);
        resetForm();
        setSelectedStaff(null);
        fetchHRStaff();
      } else {
        throw new Error(response.message || 'Failed to update HR staff');
      }
    } catch (error) {
      console.error('Error updating HR staff:', error);
      showAlert('error', error.response?.data?.message || 'Failed to update HR staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    setLoading(true);
    try {
      const response = await hrStaffApi.deleteHRStaff(selectedStaff.id);
      
      if (response.success) {
        showAlert('success', 'HR staff member deleted successfully!');
        setIsDeleteModalOpen(false);
        setSelectedStaff(null);
        fetchHRStaff();
      } else {
        throw new Error(response.message || 'Failed to delete HR staff');
      }
    } catch (error) {
      console.error('Error deleting HR staff:', error);
      showAlert('error', error.response?.data?.message || 'Failed to delete HR staff member');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone,
      designation: staff.designation,
      departmentId: staff.departmentId?.toString() || '',
      basicSalary: staff.basicSalary?.toString() || '',
      dateOfJoining: staff.dateOfJoining,
      salaryType: staff.salaryType || 'MONTHLY',
      isActive: staff.isActive !== undefined ? staff.isActive : true
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (staff) => {
    setSelectedStaff(staff);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (staff) => {
    setSelectedStaff(staff);
    setIsDeleteModalOpen(true);
  };

  const handleRefresh = async () => {
    await fetchDepartments();
    await fetchHRStaff();
  };

  const displayedStaff = hrStaffList;

  return (
    <DashboardLayout>
      <div className='p-4'>
        {/* Header */}
        <div className="flex flex-col sm:flex-row p-6 justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">HR Staff Management</h1>
            <p className="text-gray-600 mt-1">Manage HR staff members and their information</p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add HR Staff
          </Button>
        </div>

        {/* Alert */}
        {alert.show && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ show: false, type: '', message: '' })}
          />
        )}

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or employee code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* HR Staff Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee Code</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Designation</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : displayedStaff.length > 0 ? (
                  displayedStaff.map((staff) => (
                    <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{staff.employeeCode}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {staff.firstName} {staff.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{staff.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{staff.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{staff.designation}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{staff.departmentName}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          staff.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {staff.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openViewModal(staff)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(staff)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(staff)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No HR staff members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalElements)} of {totalElements} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  size="sm"
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Add HR Staff Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            resetForm();
          }}
          title="Add New HR Staff Member"
          size="lg"
        >
          <form onSubmit={handleAddStaff} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                error={formErrors.firstName}
                required
                icon={UserPlusIcon}
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                error={formErrors.lastName}
                required
                icon={UserPlusIcon}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                error={formErrors.email}
                required
                icon={EnvelopeIcon}
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                error={formErrors.phone}
                required
                icon={PhoneIcon}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                error={formErrors.designation}
                required
                icon={BriefcaseIcon}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.departmentId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  disabled={departmentsLoading}
                >
                  <option value="">
                    {departmentsLoading ? 'Loading departments...' : 'Select Department'}
                  </option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {formErrors.departmentId && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.departmentId}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Basic Salary"
                type="number"
                value={formData.basicSalary}
                onChange={(e) => setFormData({...formData, basicSalary: e.target.value})}
                error={formErrors.basicSalary}
                required
                icon={CurrencyDollarIcon}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
                <select
                  value={formData.salaryType}
                  onChange={(e) => setFormData({...formData, salaryType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="DAILY">Daily</option>
                </select>
              </div>
            </div>

            <Input
              label="Date of Joining"
              type="date"
              value={formData.dateOfJoining}
              onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})}
              error={formErrors.dateOfJoining}
              required
              icon={CalendarDaysIcon}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add HR Staff'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit HR Staff Modal - Same structure as Add Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            resetForm();
            setSelectedStaff(null);
          }}
          title="Edit HR Staff Member"
          size="lg"
        >
          <form onSubmit={handleEditStaff} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                error={formErrors.firstName}
                required
                icon={UserPlusIcon}
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                error={formErrors.lastName}
                required
                icon={UserPlusIcon}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                error={formErrors.email}
                required
                icon={EnvelopeIcon}
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                error={formErrors.phone}
                required
                icon={PhoneIcon}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                error={formErrors.designation}
                required
                icon={BriefcaseIcon}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.departmentId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  disabled={departmentsLoading}
                >
                  <option value="">
                    {departmentsLoading ? 'Loading departments...' : 'Select Department'}
                  </option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {formErrors.departmentId && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.departmentId}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Basic Salary"
                type="number"
                value={formData.basicSalary}
                onChange={(e) => setFormData({...formData, basicSalary: e.target.value})}
                error={formErrors.basicSalary}
                required
                icon={CurrencyDollarIcon}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
                <select
                  value={formData.salaryType}
                  onChange={(e) => setFormData({...formData, salaryType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="DAILY">Daily</option>
                </select>
              </div>
            </div>

            <Input
              label="Date of Joining"
              type="date"
              value={formData.dateOfJoining}
              onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})}
              error={formErrors.dateOfJoining}
              required
              icon={CalendarDaysIcon}
            />

            {/* Status Toggle - Only in Edit Modal */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee Status</label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.isActive ? 'This employee is currently active' : 'This employee is currently inactive'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                  setSelectedStaff(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update HR Staff'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* View HR Staff Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedStaff(null);
          }}
          title="HR Staff Details"
          size="lg"
        >
          {selectedStaff && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="text-gray-900">{selectedStaff.firstName} {selectedStaff.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedStaff.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedStaff.phone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employee Code</label>
                      <p className="text-gray-900">{selectedStaff.employeeCode}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Designation</label>
                      <p className="text-gray-900">{selectedStaff.designation}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <p className="text-gray-900">{selectedStaff.departmentName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Joining</label>
                      <p className="text-gray-900">{selectedStaff.formattedDateOfJoining || new Date(selectedStaff.dateOfJoining).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
                    <p className="text-gray-900">{selectedStaff.formattedSalary || `Rs. ${selectedStaff.basicSalary?.toLocaleString()}`}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Salary Type</label>
                    <p className="text-gray-900">{selectedStaff.salaryType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedStaff.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedStaff.statusDisplay || (selectedStaff.isActive ? 'Active' : 'Inactive')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedStaff(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedStaff);
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedStaff(null);
          }}
          title="Delete HR Staff Member"
        >
          {selectedStaff && (
            <div className="space-y-4">
              <p className="text-gray-900">
                Are you sure you want to delete <strong>{selectedStaff.firstName} {selectedStaff.lastName}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedStaff(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteStaff}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default HRStaffManagement;